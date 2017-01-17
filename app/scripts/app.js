/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  // Sets app default base URL
    app.baseUrl = '/';
    app.production = false;
    app.baseXlimeServiceUrl =
        //'http://localhost:8080';
          'http://expertsystemlab.com/frontend-services';
    app.sectionName = "xLiMe Showcase";
    app.sectionBlurb = "Cross-modal & cross-lingual media browsing";

    app.selectedResource = null;
    app.canAddSelectedResourceToSpheres = false;
    app.reasonCannotAddToSpheres = "No resource selected";
    
  if (window.location.port === '') {  // if production
    // Uncomment app.baseURL below and
      // set app.baseURL to '/your-pathname/' if running from folder in production
      app.production = true;
    app.baseUrl = '/xlime-brexit-showcase/';
  }

  app.displayInstalledToast = function() {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
      Polymer.dom(document).querySelector('#caching-complete').show();
    }
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
      console.log('Our app is ready to rock!');

      var onSelectedResource = function (e) {
          console.log("Caught selectedResource change", e);
          if (e.detail.value && app.isSearchString(e.detail.value)) {
              app.$.theSearch.searchValue = e.detail.value.value;
              page(app.baseUrl + 'search');
          } else {
              app.selectedResource = e.detail.value;
              if (app.selectedResource) {
                  if (app.$.theSpheres.isInContext(app.selectedResource)) {
                      console.log("SelectedResource already in context");
                      app.canAddSelectedResourceToSpheres = false;
                      app.reasonCannotAddToSpheres = "Already in spheres context";
                      app.$.toast.text = app.reasonCannotAddToSpheres;
                      app.$.toast.show();
                  } else if (app.$.theSpheres.contextSize() > 4) {
                      console.log("Context is already full");
                      app.canAddSelectedResourceToSpheres = false;
                      app.reasonCannotAddToSpheres = "Spheres context is full";
                      app.$.toast.text = app.reasonCannotAddToSpheres;
                      app.$.toast.show();
                  } else {
                      console.log("SelectedResource can be added to context");
                      app.canAddSelectedResourceToSpheres = true;
                      app.reasonCannotAddToSpheres = "";
                  }
                  var path = app.baseUrl + 'resource';
                  console.log("going to details page for resource via ", path);
                  page(path);
              }
          }
      }
      
      console.debug("Registering onAddResource handler");
      var onAddResource = function (e) {
          console.log("Caught addresource event", e);
          console.log(e.detail.resourceToAdd); // true
          app.addResourceToSpheres(e.detail.resourceToAdd);
          page(app.baseUrl);
      };

      var onRequestSemanticSearch = function(e) {
          console.log("Caught semantic search request event", e);
          console.log(e.detail.uiEntToSearch); // true
          app.$.theSearch.searchValue = e.detail.uiEntToSearch.url;
          page(app.baseUrl + 'search');
      };

      var onAjaxError = function(e) {
          app.$.toast.text = "Error communicating with server";
          app.$.toast.show();
      }

      var mySpheresElt = Polymer.dom(document).querySelector('my-spheres');
      mySpheresElt.addEventListener('selected-resource-changed', onSelectedResource);
      mySpheresElt.addEventListener('ajax-error', onAjaxError);
      
      var myRecentElt = Polymer.dom(document).querySelector('my-recent');
      console.debug("adding app listeners for  myRecentElt", myRecentElt);
      myRecentElt.addEventListener('selected-resource-changed', onSelectedResource);
      
      var myResourceElt = Polymer.dom(document).querySelector('my-resource');
      console.debug("adding app listeners for myResourceElt", myResourceElt);
      myResourceElt.addEventListener('addresource', onAddResource);
      myResourceElt.addEventListener('request-semantic-search', onRequestSemanticSearch);
      
      var mySearchElt = Polymer.dom(document).querySelector('my-search');
      console.debug("adding app listeners for mySearchElt", mySearchElt);
      mySearchElt.addEventListener('selected-resource-changed', onSelectedResource); //
      mySearchElt.addEventListener('addresource', onAddResource); //for searchString objects

  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  window.addEventListener('paper-header-transform', function(e) {
    var appName = Polymer.dom(document).querySelector('#mainToolbar .app-name');
    var middleContainer = Polymer.dom(document).querySelector('#mainToolbar .middle-container');
    var bottomContainer = Polymer.dom(document).querySelector('#mainToolbar .bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    // appName max size when condensed. The smaller the number the smaller the condensed size.
    var maxMiddleScale = 0.50;
    var auxHeight = heightDiff - detail.y;
    var auxScale = heightDiff / (1 - maxMiddleScale);
    var scaleMiddle = Math.max(maxMiddleScale, auxHeight / auxScale + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    app.$.headerPanelMain.scrollToTop(true);
  };

  app.closeDrawer = function() {
    app.$.paperDrawerPanel.closeDrawer();
  };

  app.addResourceToSpheres = function(resToAdd) {
      app.$.theSpheres.addToSpheres(resToAdd);
  };

  app.gotoSearchPage = function() {
      page(app.baseUrl + "search");
  };

  app.isSearchString = function(obj) {
      if (obj && obj['@type'])
          return obj['@type'] === "http://xlime.eu/vocab/searchString";
      else return false;
  };
    
  app.refreshCurrent = function() {
      function hasRefresh(elt) {
          if (elt) {
              console.log("typeof", typeof elt['hasRefresh']);
              if (typeof elt['hasRefresh'] === 'function') return true;
              return false;
          } else return false;
      }
      console.log("handling refresh for ", app.$.contentPages.selectedItem);
      console.log("handling refresh for ", app.$.contentPages.selectedItem.firstElementChild);
      console.log("element has refresh? ", hasRefresh(app.$.contentPages.selectedItem.firstElementChild));      
      console.log("refreshing ", app.$.contentPages.selectedItem.firstElementChild.refresh());
  };
    
  app.goBack = function() {
      window.history.back();    
  };

})(document);
