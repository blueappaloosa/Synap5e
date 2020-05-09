var myCodeMirror = null;
var textFile = null;
var frame = null; //frame that runs the P5 code and canvas
var console_frame = null; //frame that runs the mock console
var asset_frame = null; //frame that manages images/sounds
var load_frame = null; //frame for saving/loading
var middle_bar = null; //middle bar, for resizing things
var textarea = null; //textarea that codemirror overwrites, for text mode

var assets_ready = false;
var frame_ready = false;
var asset_list = [];

var textonly = false; //for toggling plain text vs. editor

var audiolib = true; //toggle use of audio library
var domlib = true; //toggle use of DOM library

var horiz_split = 0.50; //determines where the horizantal split is on the page
var vert_split = 0.50; //determines where the vertical split is on the page

//for syntax highlighting, "console" added for simplicity
var p5globals = ["textBounds","Renderer","Renderer2D","Renderer3D","font","loadFont","byte","char","boolean","str","float","unchar","hex","unhex","int","console","x","y","z","set","copy","add","sub","mult","div","mag","magSq","dot","cross","dist","normalize","limit","setMag","heading","rotate","lerp","array","equals","fromAngle","random2D","random3D","angleBetween","resize","copy","mask","filter","save","file","type","subtype","name","size","columns","rows","addRow","removeRow","getRows","findRow","findRows","matchRow","matchRows","getColumn","clearRows","addColumn","getRowCount","removeTokens","trim","removeColumn","setNum","setString","getNum","getString","elt","parent","id","mousePressed","mouseWheel","mouseMoved","mouseOver","mouseOut","dragOver","dragLeave","drop","touchIsDown","text","textFont","textAlign","textLeading","textSize","textStyle","textWidth","applyMatrix","resetMatrix","rotate","scale","shearX","shearY","translate","beginContour","beginShape","bezierVertex","curveVertex","endContour","endShape","quadraticVertex","vertex","bezier","bezierPoint","bezierTangent","curve","curveTightness","curvePoint","curveTangent","ellipseMode","noSmooth","rectMode","smooth","strokeCap","strokeJoin","strokeWeight","arc","ellipse","line","point","quad","rect","triangle","createCanvas","resizeCanvas","noCanvas","createGraphics","blendMode","print","p5","Element","randomSeed","random","randomGaussian","acos","asin","atan","atan2","cos","sin","tan","degrees","radians","angleMode","noise","noiseDetail","noiseSeed","abs","ceil","constrain","dist","exp","floor","lerp","log","mag","map","max","min","norm","pow","round","sq","sqrt","createVector","Vector","touchX","touchY","ptouchX","ptouchY","touches","touchStarted","touchMoved","touchEnded","day","hour","minute","millis","month","second","year","alpha","blue","brightness","color","green","hue","lerpColor","red","saturation","background","clear","colorMode","fill","noFill","noStroke","stroke","HALF_PI","PI","QUARTER_PI","TAU","TWO_PI","preload","setup","draw","remove","noLoop","loop","push","pop","redraw","append","arrayCopy","concat","reverse","shorten","sort","splice","subset","float","int","join","match","matchAll","nf","nfc","nfp","nfs","split","splitTokens","trim","Table","TableRow","save","frameCount","focused","cursor","frameRate","noCursor","displayWidth","displayHeight","windowWidth","windowHeight","windowResized","width","height","fullscreen","devicePixelScaling","getURL","getURLPath","getURLParams","createImage","Image","loadImage","image","tint","noTint","imageMode","pixels","blend","copy","filter","get","loadPixels","set","updatePixels","loadJSON","loadStrings","loadTable","loadXML","httpGet","httpPost","httpDo","keyIsPressed","key","keyCode","keyPressed","keyReleased","keyTyped","keyIsDown","mouseX","mouseY","pmouseX","pmouseY","winMouseX","winMouseY","pwinMouseX","pwinMouseY","mouseButton","mouseIsPressed","mouseMoved","mouseDragged","mousePressed","mouseReleased","mouseClicked","mouseWheel","BACKSPACE","DELETE","ENTER","RETURN","TAB","ESCAPE","SHIFT","CONTROL","OPTION","ALT","UP_ARROW","DOWN_ARROW","LEFT_ARROW","RIGHT_ARROW","RADIANS","DEGREES","CENTER","RADIUS","CORNER","CORNERS","SQUARE","PROJECT","ROUND","SQUARE","PROJECT","MITER","BEVEL","ROUND","TOP","BOTTOM","CENTER","BASELINE","LEFT","CENTER","RIGHT"];
var p5audio = ["SoundFile","loadSound","isLoaded","play","playMode","pause","loop","isPlaying","isPaused","stop","setVolume","pan","rate","duration","currentTime","jump","channels","sampleRate","frames","getPeaks","reverseBuffer","connect","disconnect","getLevel","setPath","processPeaks","addCue","removeCue","clearCues","Amplitude","setInput","toggleNormalize","smooth","AudioIn","enabled","start","stop","amp","listSources","setSource","FFT","waveform","analyze","getEnergy","Oscillator","sine","triangle","sawtooth","square","freq","setType","phase","add","mult","scale","SinOsc","TriOsc","SawOsc","SqrOsc","Noise","Pulse","Env","attackTime","attackLevel","decayTime","decayLevel","sustainTime","sustainLevel","releaseTime","releaseLevel","set","triggerAttack","triggerRelease","Delay","leftDelay","rightDelay","lowPass","process","delayTime","feedback","filter","Filter","LowPass","HighPass","BandPass","res","biquadFilter","Reverb","Convolver","createConvolver","convolverNode","impulses","addImpulse","resetImpulse","toggleImpulse","SoundRecorder","record","saveSound","Phrase","sequence","Part","setBPM","getBPM","addPhrase","removePhrase","getPhrase","replaceSequence","onStep","Score","part","getAudioContext","getMasterVolume","masterVolume","soundOut","sampleRate","midiToFreq","soundFormats","PeakDetect","isDetected","update","Gain" ];
var p5dom = ["addClass", "removeClass", "child", "html", "position", "style", "attribute", "value", "show", "hide", "size", "remove", "select", "selectAll", "removeElement", "createDiv", "createP", "createSpan", "createImg", "createA", "createSlider", "createButton", "createCheckbox", "createSelect", "createInput", "createFileInput", "createVideo", "createAudio", "createCapture", "createElement", "MediaElement", "autoplay", "showControls", "hideControls", "File", "type", "subtype", "name", "size"];
var p5vars = "^(";

if (audiolib) {
    p5globals = p5globals.concat(p5audio);
}
if (domlib) {
    p5globals = p5globals.concat(p5dom);
}

p5vars+=p5globals[0];
    
for(var i = 1; i < p5globals.length; i++){
    p5vars+="|";
    p5vars+=p5globals[i];
}
/*
for(var j=0; j<p5audio.length; j++){
    p5vars+="|";
    p5vars+=p5audio[i];
}
*/

p5vars+=")\\b";
    
//console.log(p5vars);
    
var p5reg = new RegExp(p5vars);
    
//setup highlighting for P5 functions/vars
var p5modeOverlay = {           
    token: function(stream, state){
        if (stream.peek().match(/[A-Za-z]/)) {
            if (stream.match(p5reg)) {
                return "p5";
            }else{
                while (stream.peek() !== null && stream.eatWhile(/[A-Za-z_]/)) {}
                return null;
            }
        }
        if (stream.peek().match(/\//)) {
            if (stream.match(/\/\//)) {
                stream.skipToEnd();
                return null;
            }else{
                stream.eat(/\//);
            }
        }
        while (stream.peek() !== null && stream.eatWhile(/[^A-Za-z\/]/)) {}
        return null;
    }
};

function setupEditor(){
    frame = document.getElementById('p5_canvas');
    console_frame = document.getElementById('console_frame');
    asset_frame = document.getElementById('asset_frame');
    middle_bar = document.getElementById('middle_bar');
    load_frame = document.getElementById('load_frame');
    
    asset_frame.style.display = "none";
    load_frame.style.display = "none";
    textarea = document.getElementById('code');
     
     var t = getCookie("mode");
    
    if (t ==="" || t== "normal" ) {
        setupCodeMirror();
        document.getElementById("textboxmode").checked = false;
    }else if (t=="plaintext") {
        textonly = true;
        document.getElementById("textboxmode").checked = true;
    }
    
     resize();
    document.onfocus = resize;
    window.onresize = resize;
}

function toggleAccessibility(elem){
    //console.log("click");
    //console.log(elem.checked);
    if (!elem.checked) {
        setupCodeMirror();
        textonly = false;
        setCookie("mode", "normal", 14);
    }else {
        myCodeMirror.toTextArea();
        textonly = true;
        setCookie("mode", "plaintext", 14);
        resize();
          
    }
}

 
 //setup stuff for codemirror
function setupCodeMirror(){
    
    
    var codeArea = document.getElementById('code');
     
    myCodeMirror = CodeMirror.fromTextArea(codeArea, {
        lineNumbers: true,
        mode: "javascript",
        gutters: ["CodeMirror-lint-markers"],
        lint: {"curly": true, "undef": true, "funcscope": true, "predef": p5globals},
        matchBrackets: true,
        theme: "midnight",
        highlightSelectionMatches: {showToken: /[A-Za-z_]/},
        styleActiveLine: true,
        inputStyle: "contenteditable",
        extraKeys: {Tab: function(cm){document.getElementById("runcode").focus();console.log("tab");}},
      //  dragDrop: false
        tabindex: 0,
        autofocus: true
        });
   /*
    myCodeMirror.setOption("extraKeys", {
        
    Tab: function (cm){
        console.log("tab");
        return false;
    }
    });
   */ 
   // myCodeMirror.setOption("lint",{"curly": true, "undef": true, "unused": true, "funcscope": true, "predef": p5globals} );
    
    myCodeMirror.addOverlay(p5modeOverlay);
   
}
    


//when "run" is pressed, we create the text file
function makeTextFile() {
    
    console_frame.contentWindow.postMessage({type: "clear"}, '/');
    asset_frame.contentWindow.postMessage({type: "getList"}, '/');
    frame.contentWindow.location.reload(true);
    frame.onload=function(){
        frame_ready = true;
        if (assets_ready) {
            makeFile();
        }};
    assets_ready = false;
    frame_ready = false;
    asset_list = [];
}

function makeFile(){
    var code;
    if(textonly){
        code = textarea.value;
    }else{
        code = myCodeMirror.getValue();
    }
    
   // console.log(list);    
    
    if(code.indexOf('new p5()') === -1) {
          code += '\nnew p5();';
    }
    
   // list.forEach(function(elem, index, array){
   asset_list.forEach(function(elem, index, array){
        var f = new RegExp((elem.filename).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
        code = code.replace(f, elem.url);
       // console.log ("replacing "+elem.filename+" with "+elem.url);
    });
    
    console.log(code);
        
    var data = new Blob([code], {type: 'text/javascript'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data); 
    
    frame.contentWindow.postMessage({type: "run", data: textFile}, "/");
    frame.focus();
}
  
function stopCode(){
   // frame.contentWindow.postMessage({type:"stop"}, "/");
   frame.contentWindow.location.reload(true);
   frame.onload = null;
  }
  
  
function resize(){
    document.getElementById('main_div').style.height = Math.floor(window.innerHeight * horiz_split)+"px";
    
    frame.style.height = Math.floor(window.innerHeight * horiz_split)+"px";
    frame.style.width = "100%";
    
    if (!textonly) {
        myCodeMirror.setSize(Math.floor(window.innerWidth * vert_split)-5, Math.floor(window.innerHeight * (1-horiz_split))-32);
    }else{
    textarea.style.height = Math.floor(window.innerHeight * (1-horiz_split))-32+"px";
    textarea.style.width = Math.floor(window.innerWidth * vert_split)-5+"px";
    }

    
    console_frame.style.height = Math.floor(window.innerHeight * (1-horiz_split))-30+"px";
    console_frame.style.width = Math.floor(window.innerWidth * (1-vert_split))-5+"px";
    
    console_frame.contentWindow.postMessage({type: "resize", vert: Math.round(window.innerWidth * (1-vert_split))-5, horiz: Math.floor(window.innerHeight * (1-horiz_split))-32}, '/');
    console_frame.contentWindow.postMessage({type: "rescroll"}, '/');
    /*
    console_frame.contentWindow.document.body.style.height = Math.round(window.innerHeight * (1-horiz_split))-31+"px";
    console_frame.contentWindow.document.getElementById('error_wrapper').style.height = Math.round(window.innerHeight * (1-horiz_split))-31+"px";
    console_frame.contentWindow.document.getElementById('error_wrapper').style.width = Math.round(window.innerWidth * (1-vert_split))-2+"px";
    */
    asset_frame.style.height = Math.floor(window.innerHeight * (1-horiz_split))-30+"px";
    asset_frame.style.width = Math.round(window.innerWidth * (1-vert_split))-5+"px";
    
    asset_frame.contentWindow.postMessage({type: "resize", vert: Math.round(window.innerWidth * (1-vert_split))-5, horiz: Math.floor(window.innerHeight * (1-horiz_split))-32}, '/');
    
    load_frame.style.height = Math.floor(window.innerHeight * (1-horiz_split))-30+"px";
    load_frame.style.width = Math.round(window.innerWidth * (1-vert_split))-5+"px";
    
    load_frame.contentWindow.postMessage({type: "resize", vert: Math.round(window.innerWidth * (1-vert_split))-5, horiz: Math.floor(window.innerHeight * (1-horiz_split))-32}, '/');
    
    
    middle_bar.style.height = Math.floor(window.innerHeight * (1-horiz_split))-30+"px";
    middle_bar.style.left = Math.round(window.innerWidth * (vert_split))-5+"px";
    middle_bar.style.top = Math.floor(window.innerHeight * (horiz_split))+30+"px";
    /*
    asset_frame.contentWindow.document.body.style.height = Math.round(window.innerHeight * (1-horiz_split))-31+"px";
    asset_frame.contentWindow.document.getElementById('inner_wrapper').style.height = Math.round(window.innerHeight * (1-horiz_split))-31+"px";
    asset_frame.contentWindow.document.getElementById('inner_wrapper').style.width = Math.round(window.innerWidth * (1-vert_split))-2+"px";
    */
    if (!textonly) {
        myCodeMirror.refresh();
    }
    
    
   // console_frame.contentWindow.postMessage("resizing!", "/");
}
  
  
window.addEventListener('message', function(e){
    
	if (!checkDomain(e.origin)) {
		return;
	}
    
       // console.log(e);
        
    if (e.source == frame.contentWindow) {
        if (e.data.type == "error") {
            console_frame.contentWindow.postMessage(e.data, '/');
        }else if (e.data.type == "msg") {
            console_frame.contentWindow.postMessage(e.data, '/');
       // }else if (e.data.type == "ready") {
       //     frame_ready = true;
       //     if (assets_ready) {
        //        makeFile();
        //    }
        }
    }else if (e.source == asset_frame.contentWindow) {
        if (e.data.type =="assetList") {
            assets_ready = true;
            asset_list = e.data.list
          if(frame_ready)  makeFile();
        }  else if (e.data.type =="assetList2") {
            sendZip(e.data.list);
        } 
    }else if (e.source == load_frame.contentWindow) {
        if (e.data.type =="zipData") {
           zipSetup();
        }else if (e.data.type == "loadFile") {
            myCodeMirror.doc.setValue(e.data.sketch);
        }else if (e.data.type == "loadAsset") {
            e.data.list.forEach(function(element, index, array){
						console.log(element.filename);
				});
            asset_frame.contentWindow.postMessage({type:"addAsset", files: e.data.list}, '/');
            asset_frame.contentWindow.postMessage({type:"inactive"}, '/');
        }else if (e.data.type == "clearAssets") {
            asset_frame.contentWindow.postMessage({type:"clearAll"}, '/');
        }
    }
});

function zipSetup() {
    asset_frame.contentWindow.postMessage({type: "getList2"}, '/');
}

function sendZip(list){
    var code = myCodeMirror.getValue();
    console.log('wohoo');
    load_frame.contentWindow.postMessage({type:"sendZip", assets: list, sketch: code}, '/');
}


//stuff for managing tabs
var CONSOLE = 0;
var ASSETS = 1;
var LOAD = 2;

var current_tab = CONSOLE;

function closeAssets() {
    asset_frame.style.display = "none";
    document.getElementById("asset_tab").className = "inactive_tab";
    asset_frame.contentWindow.postMessage({type: "inactive"}, '/');
}

function closeLoad(){
    load_frame.style.display = "none";
    document.getElementById("load_tab").className = "inactive_tab";
    load_frame.contentWindow.postMessage({type: "inactive"}, '/');
}

function closeConsole(){
    console_frame.style.display = "none";
    document.getElementById("console_tab").className = "inactive_tab";
    console_frame.contentWindow.postMessage({type: "inactive"}, '/');
}

function consoleClick(){
    if (current_tab !=CONSOLE) {
        if (current_tab == ASSETS) {
            closeAssets();
        }else if (current_tab == LOAD) {
            closeLoad();
        }
        
        current_tab = CONSOLE;
        console_frame.style.display = "block";  
        document.getElementById("console_tab").className = "active_tab";
        console_frame.contentWindow.postMessage({type: "rescroll"}, '/');
        console_frame.contentWindow.postMessage({type: "active"}, '/');
    }
    console_frame.focus();
}

function assetsClick(){
    if (current_tab !=ASSETS) {
        if (current_tab == CONSOLE) {
            closeConsole();
        }else if (current_tab == LOAD) {
            closeLoad();
        }
        
        current_tab = ASSETS;
        asset_frame.style.display = "block";   
        document.getElementById("asset_tab").className = "active_tab";
        asset_frame.contentWindow.postMessage({type: "active"}, '/');
        
       }
    asset_frame.focus();
}

function loadClick() {
    if (current_tab !=LOAD) {
        if (current_tab == ASSETS) {
            closeAssets();
        }else if (current_tab == CONSOLE) {
            closeConsole();
        }
        
        current_tab = LOAD;
        load_frame.style.display = "block";
        document.getElementById("load_tab").className = "active_tab";
        load_frame.contentWindow.postMessage({type: "active"}, '/');  
    }
    load_frame.focus();
}


//functions for draging bars to resize
function dragVert(){
    document.body.addEventListener("mousemove", moveVert, true);
   console_frame.style.pointerEvents = "none";
   asset_frame.style.pointerEvents = "none";
   frame.style.pointerEvents = "none";
   load_frame.style.pointerEvents = "none";
}

function stopDragVert(){
    document.body.removeEventListener("mousemove", moveVert, true);
    console_frame.style.pointerEvents = "auto";
   asset_frame.style.pointerEvents = "auto";
   frame.style.pointerEvents = "auto";
   load_frame.style.pointerEvents = "auto";
}

function dragHoriz(){
   // drag_horiz = true;
   document.body.addEventListener("mousemove", moveHoriz, true);
   console_frame.style.pointerEvents = "none";
   asset_frame.style.pointerEvents = "none";
   load_frame.style.pointerEvents = "none";
}

function stopDragHoriz(){
   // drag_horiz = false;
    document.body.removeEventListener("mousemove", moveHoriz, true);
    console_frame.style.pointerEvents = "auto";
   asset_frame.style.pointerEvents = "auto";
}

function moveHoriz(e){
    vert_split = e.clientX/window.innerWidth;
   // e.currentTarget.style.left = e.pageX - 5+"px";
    resize();
   // console.log("moving! "+vert_split);
    return false;
}

function moveVert(e){
    horiz_split = e.clientY/window.innerHeight;
   // e.currentTarget.style.left = e.pageX - 5+"px";
    resize();
   // console.log("moving! "+vert_split);
    return false;
}


function closeWin(e){
    if (!e) {
        e = e || window.event;
    }
  //IE & Firefox
  if (e) {
    e.returnValue = "Have you saved? Leaving this page will result in losing data.";
  }
 return "Have you saved? Leaving this page will result in losing data.";
}

window.onbeforeunload = closeWin;