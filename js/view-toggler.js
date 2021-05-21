function detailToggle(item) {
    document.getElementById(item).classList.toggle("show");
  }
  
  function scroll() {
    let linkTabs = document.getElementById("link-holder");
    let mainProfile = document.getElementById("profile-main");
    let tabLinkProfile = document.getElementById("tab-link-profile");
  
    if (window.scrollY > 50) {
      addClass(linkTabs, 'top');
      addClass(mainProfile, 'optional-info');
      addClass(tabLinkProfile, 'show')
    } else{
      removeClass(linkTabs, 'top');
      removeClass(mainProfile, 'optional-info');
      removeClass(tabLinkProfile, 'show')

    }
  }
  
 function addClass(item, styleClass) { 
    item.classList.add(styleClass)
   }
  
 function removeClass(item, styleClass) { 
    item.classList.remove(styleClass)
   }
  
   module.exports = {
     detailToggle: detailToggle,
     appScroll: scroll,
     appAddClass: addClass,
     appRemoveClass: removeClass
   }
  
  
  