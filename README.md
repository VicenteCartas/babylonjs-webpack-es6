# New SpriteMap renderer

Writing a new version of SpriteMap, main goals:
- Based on TilEd map format instead of AtlasJson (support as many capabilities as possible from TilEd)
- Capable of rendering non orthogonal maps (hexes and isometric)
- Pixel perfect rendering of the map at any zoom or with any camera movement

Currently implemented:
- Support parsing of tiled maps and tilesets files
- Support for inline and outside tilesets
- Support for single image and multi image tilesets
- Support for any number of layers
- Rendering of orthogonal maps

Not implemented yet
- Hexagonal maps - In progress
- Isometric maps - In progress
- Tile picking - Planned
- Animations - Under investigation
- Advanced TilEd features (objects, compression...) - Under investigation
- Using shaders for rendering the map - Not planned
