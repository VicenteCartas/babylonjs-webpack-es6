# New SpriteMap renderer

Writing a new version of SpriteMap, main goals:
- Based on Tiled map format instead of AtlasJson - https://doc.mapeditor.org/en/stable/reference/tmx-map-format/
- Capable of rendering non orthogonal maps (hexagonal and isometric)
- Pixel perfect rendering of the map at any zoom or with any camera movement

Currently implemented:
- Support parsing of Tiled maps and tilesets files
- Support for inline and external tilesets
- Support for single image and multi image tilesets
- Support for any number of layers
- Rendering orthogonal maps
- Rendering hexagonal maps

Not implemented yet
- Isometric maps - In progress
- Tile picking - Planned
- Animations - Under investigation
- Advanced Tiled features (objects, compression...) - Under investigation
- Using shaders for rendering the map - Not planned

Example:

![image](https://github.com/user-attachments/assets/0a98f9c0-10b8-4d7e-8bbb-2c4adf159587)
