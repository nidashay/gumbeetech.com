
document.addEventListener('DOMContentLoaded', function(){
	var toggle = document.getElementById('navToggle');
	var nav = document.getElementById('siteNav');
	if(toggle && nav){
		toggle.addEventListener('click', function(){
			var open = nav.classList.toggle('open');
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		});
		// close when a link is clicked (mobile)
		nav.querySelectorAll('a').forEach(function(a){
			a.addEventListener('click', function(){
				if(nav.classList.contains('open')){
					nav.classList.remove('open');
					toggle.setAttribute('aria-expanded','false');
				}
			})
		});
	}
});
