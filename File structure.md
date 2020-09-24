# File structure


## Example
-----------------------------------
File structure:
```scss
dev/ 	// development dir
	index.html // - compiled dev files for live server (browser)
	css/        // - compiled styles
	js/         // - compiled js
	// src v1
	_src/        // source file for dev
	    scss/    // source general styles
	    js/      // source general js
	    view/     // source page, parts, blocks, components
	// src v2
	_scr/
	    blocks/
	        news/
	            news.njk
	            news.scss
	            news.js
	    components/
	    pages/
	    layout/
	    general/
	        style.scss
	        main.js
	        js/
	            scriptName/
	                scriptName.js
	        scss/
	            _mixins.scss
    // src v3  // - повторяем структуру в dev/
    _src/
        index.njk
        blocks/
        components/
        ? pages/ ?
        styles/
            main.scss
            _partial.scss
        scripts/
            main.js
            _partial.js
        
        
	
	        
	    
	    
	    

dist/	// production dir

```

