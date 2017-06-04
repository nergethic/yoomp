**TODO**

- shader program for entityType not every entity
- replace gl-matrix.js with your own code
- modularize gl code
- count lags and once it reaches certain limit adjust jump position of the ball to sync with music
- add font support with color info
- add menus
- score logic
- save logic
- after 1 death on the level extralife tiles are converted to normal tiles
- proper ball texture / shader
- requestedAudio: fix sound not always plays correctly
- convert arrays to float32Array
- needsUpdate for uniforms and attributes
- container clone position
- after teleport properly compute abstilepos

* refactor gl code: shader material

+ add sound info not in handling collision
+ fix empty space (black lines) between tiles
+ collision for empty area in texture
+ level editor
+ better idea for timing, doing something periodically (instead of frame counter)
+ make every floor entity round
+ separate vertex buffer for every mesh
+ change coords to your own unit space and convert it to screen space <-1.0:1.0> in the shader
+ fix how to properly time animations

**Draw-Calls-Ideas**

- !!! all geometry data goes to the GPU on init, then draw only list
+ 1. same geometry that is static (doesn't move) goes to one container-object - shares one single meterial
+ 2. (one for one material) texture atlas for normal textures and one for opaque material
* review why Casey thinks texture atlases are not a good idea, what are the alternatives?