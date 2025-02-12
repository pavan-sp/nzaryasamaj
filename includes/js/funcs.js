/**
 * @author Simple
 */

/******************** Start Image Fade Section ***************************/
/* Image fade/swap variables */
var i=0;
var j=100;
var f;
var b;
var Speed = 5000;
var Div1 = 'first';
var Div2 = 'second';
var NextImg = 1;
var NextDiv = 'second';
var CurrentDiv  = 'first';

var slideshowArray=[];
var ImgArray=['images/paradise1.jpg','images/paradise2.jpg','images/paradise3.jpg','images/paradise4.jpg','images/paradise5.jpg','images/paradise6.jpg'];

/* Image fade/swap functions */

function lightup(imageobject, opacity){
 if (navigator.appName.indexOf("Netscape")!=-1
  &&parseInt(navigator.appVersion)>=5)
    imageobject.style.MozOpacity=opacity/100;
 else if (navigator.appName.indexOf("Microsoft")!= -1 
  &&parseInt(navigator.appVersion)>=4)
    imageobject.filters.alpha.opacity=opacity;
}

function fade()
{
	var aa = document.getElementById(Div2);
	var ab = document.getElementById(Div1);
	
	if(i>=0)
	{
		i-=1;
		lightup(aa, i);
	}
	if(j<=100)
	{
		j+=1
		lightup(ab, j);
	}
	if(i==0)
	{
		clearInterval(window.f);
		SetImage();
	}
}

function brighten()
{
	var ba = document.getElementById(Div2);
	var bb = document.getElementById(Div1);

	if(i<=100)
	{
		i+=1;
		lightup(ba, i);
	}
	if(j>=0)
	{
		j-=1;
		lightup(bb, j);
	}
	if(i==100)
	{
		clearInterval(window.b);
		SetImage();
	}
}

function controller1()
{
	b=setInterval('brighten()',10);
	if(window.f)
		clearInterval(window.f);
	tm=setTimeout("controller2()",Speed);
}

function controller2()
{
	f=setInterval('fade()',10);
	if(window.b)
		clearInterval(window.b);
	sm=setTimeout("controller1()",Speed);
}

function firstImg()
{
	document.getElementById(Div1).src = ImgArray[0];
}

function SetImage()
{
	document.getElementById(NextDiv).src = ImgArray[NextImg];
	if(NextDiv == Div2)
		NextDiv = Div1;
	else
		NextDiv = Div2;

	if(NextImg == ImgArray.length-1)
		NextImg=0;
	else
		NextImg++;
}
/******************** End Image Fade Section ***************************/

/******************** Start Property Page Section ***************************/

function Over(id)
{
	document.getElementById(id).style.backgroundColor = "#DDDDDD";
	//document.body.style.cursor = "pointer";
}

function Out(id)
{
	document.getElementById(id).style.backgroundColor = "#FFFFFF";
	//document.body.style.cursor = "default";
}

/******************** End Property Page Section ***************************/

/******************** Start Slideshow Section ***************************/
var currentPic = 0;
var currentFrame = 'Div1';
var pnImg;
var op = 100;
var SlideSpeed = 1;
var step = 10;

function previousImg()
{
	if (currentPic != 0)
	{
		currentPic--;
		pnImg = setInterval('FadeoutNswitchImg()', SlideSpeed);
	}
}

function nextImg()
{
	if(currentPic != slideshowArray.length -1)
	{
		currentPic++;
		pnImg = setInterval('FadeoutNswitchImg()',SlideSpeed);
	}
}

function FadeoutNswitchImg()
{
	var slideFrame = document.getElementById('imgDiv1');
	if (op >= 0) {
		op-= step;
		lightup(slideFrame, op);
	}
	if (op == 0) {
		clearInterval(window.pnImg);
		setCurentSlide(slideFrame);
		pnImg = setInterval('FadeIn()',SlideSpeed);
		
	}
}

function FadeIn()
{
	var slideFrame = document.getElementById('imgDiv1');
	if (op <= 100) {
		op+= step;
		lightup(slideFrame, op);
	}
	if (op == 100) {
		clearInterval(window.pnImg);
	}
}
function setCurentSlide(curSlide)
{
	curSlide.src = slideshowArray[currentPic];
	if (currentPic == 0) {
		document.getElementById('prevImg').src = "includes/img/none.gif";
		document.body.style.cursor = "default";
	}
	else {
		document.getElementById('prevImg').src = "includes/img/previous.gif";
	}
	if (currentPic == slideshowArray.length - 1) {
		document.getElementById('nextImg').src = "includes/img/none.gif";
		document.body.style.cursor = "default";
	}
	else {
		document.getElementById('nextImg').src = "includes/img/next.gif";
	}
}
/******************** End Slideshow Section ***************************/

/******************** Start Search Form Section ***************************/
var regions		= "";
var districts	= [];
var suburbs		= [];
function setreg(){
	$("#region").removeOption(/./);
	$("#region").addOption(regions, false);
	disableSelect(2);
}
function setcmsreg(){
	$("#region").removeOption(/./);
	$("#region").addOption(regions, false);
}
function setdist(idx){
	if(idx == 0)	{
		resetDist();
		resetSub();
		disableSelect(2);
	}else{
		enableSelect(1);
		resetSub();
		disableSelect(1)
		$("#district").removeOption(/./);
		$("#district").addOption(districts[0], false);
		$("#district").addOption(districts[idx], false);
	}
}
function setsub(idx){
	if(idx == 0){
		resetSub();
		disableSelect(1);
	}else{
		enableSelect(2);
		$("#suburb").removeOption(/./);
		$("#suburb").addOption(suburbs[0], false);
		$("#suburb").addOption(suburbs[idx], false);
	}
}
function disableSelect(count){
	if(count == 1)
		$("#suburb").attr("disabled","disabled");
	else{
		$("#district").attr("disabled","disabled");
		$("#suburb").attr("disabled","disabled");
	}
}
function enableSelect(count){
	if(count == 1)
		$("#district").attr("disabled","");
	else if(count == 2)
		$("#suburb").attr("disabled","");
	else{
		$("#district").attr("disabled","");
		$("#suburb").attr("disabled","");
	}
}
function resetDist(){
	$("#district").removeOption(/./);
	$("#district").addOption(districts[0], false);
}
function resetSub(){
	$("#suburb").removeOption(/./);
	$("#suburb").addOption(suburbs[0], false);
}
/******************** End Search Form Section ***************************/