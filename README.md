# Boilerplate-2020-Gulp-Nunjucks-SCSS
Boilerplate to start html/njk+css/scss+js on Gulp 4, Includes: bourbon, mw-grid,screw.scss

## The Gulp frontend development paradigm.

1. Gulp - Automates file tasks.
2. Files has 3 states:
    * :src  - Source files in which the developer writes the code
    * :dev  - Compiled files for browser development
    * :prod  - Ready-made files for a production server

3. File space is divided into 3 zones
    * dev/_scr/  (for :src)
    * dev/   (for :dev)
    * dist/  (for :prod)

4. The structure in all zones is the same (dev / repeats _src /, dist / repeats dev /)
5. Gulpfile.js - written in a functional style so that the code is scalable and encapsulated.
6. The names of the functions that convert files and the 1st state (src) into the 2nd (dev) end with the suffix -Dev,
names of functions that convert files from the 2nd state to the 3rd (prod) end with the -Build suffix.