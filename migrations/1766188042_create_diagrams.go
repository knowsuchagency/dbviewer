package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection := core.NewBaseCollection("diagrams")

		// Name of the diagram
		collection.Fields.Add(&core.TextField{
			Name:     "name",
			Required: true,
			Max:      255,
		})

		// Description (optional)
		collection.Fields.Add(&core.TextField{
			Name:     "description",
			Required: false,
			Max:      1000,
		})

		// DBML source code
		collection.Fields.Add(&core.TextField{
			Name:     "dbml",
			Required: true,
			Max:      1000000, // 1MB
		})

		// Canvas state (React Flow viewport, node positions)
		collection.Fields.Add(&core.JSONField{
			Name:    "canvasState",
			MaxSize: 1000000, // 1MB for large schemas
		})

		// Owner relation to users
		collection.Fields.Add(&core.RelationField{
			Name:          "owner",
			Required:      true,
			MaxSelect:     1,
			CollectionId:  "_pb_users_auth_",
			CascadeDelete: true,
		})

		// Access rules - owner can CRUD their own diagrams
		collection.ListRule = types.Pointer("@request.auth.id = owner")
		collection.ViewRule = types.Pointer("@request.auth.id = owner")
		collection.CreateRule = types.Pointer("@request.auth.id != ''")
		collection.UpdateRule = types.Pointer("@request.auth.id = owner")
		collection.DeleteRule = types.Pointer("@request.auth.id = owner")

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("diagrams")
		if err != nil {
			return nil // Collection doesn't exist, nothing to delete
		}
		return app.Delete(collection)
	})
}
