(async function App(){
  /**
  * Debug section
  **/
  let currentUser = {
    name: "Guest"
  };
  /**
  *
  **/
  let bodyscope;
  let persistence;
  firebase.auth().getRedirectResult().then((result)=>{
    firebase.auth().onAuthStateChanged(user =>{
      let credential = result.credential;
      if(user != null){
        if(bodyscope != undefined){
          bodyscope.loggedIn = true;
          bodyscope.removePost = function(postID){
            if(prompt('Are you sure you want to delete this post?\nType "Yes" to continue.') == "Yes"){
              firebase.database().ref(`posts/${postID}`).remove();
            }
          };
          firebase.database().ref('users').on('value', (u)=>{
            bodyscope.users = u.val();
            bodyscope.onlineUsers = (function(){
              let online_user_count = 0;
              Object.values(bodyscope.users).forEach((user)=>{
                if(user.online == true){
                  online_user_count++;
                }
              });
              return online_user_count;
            })();
          });
        }
        currentUser = firebase.auth().currentUser;
        let userReference = firebase.database().ref(`users/${currentUser.uid}`);
        userReference.on('value', (v) => {
          let data = v.val();
          for(let kn in data){
            currentUser[kn] = data[kn];
          }
          currentUser.name = currentUser.displayName;
          if(bodyscope != undefined){
            bodyscope.currentUser = currentUser;
          }
        });
        userReference.update({
          name: currentUser.displayName,
          uid: currentUser.uid,
          online: true
        });
        userReference.onDisconnect().update({
          online: false
        });
      }else{
        currentUser = {
          name: "Guest"
        };
      }
    });
  },(error)=>{
    let email = error.email;
    let credential = error.credential;
  });
  function login(){
    var provider;
    provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().setPersistence(persistence).then(function(){
      return firebase.auth().signInWithRedirect(provider);
    });
  }
  function logout(){
    firebase.database().ref(`users/${currentUser.uid}`).update({
      online: false
    });
    firebase.auth().signOut().then(()=>{
      location.reload();
    }).catch((error)=>{
      // An error happened.
      console.log(error);
      alert("Somehow you screwed up logging out.");
    });
  }
  Array.prototype.multipart = function(name) {
    let rv = {};
    for (let i = 0; i < this.length; i++) {
      rv[`${name}${i}`] = this[i];
    }
    return rv;
  };
  String.prototype.separate = function(amt) {
    return this.match(new RegExp(`.{1,${amt}}`, 'g'));
  };
  function objToReferableArray(obj){
    let rv = [];
    for(let kn in obj){
      let kv = obj[kn];
      kv.___id___ = kn;
      rv.push(kv);
    }
    return rv;
  }
  function updateScope(scope){
    scope.$apply();
  }
  function updatePosts(posts){
    if(bodyscope != undefined){
      bodyscope.postsOriginal = posts;
      bodyscope.posts = objToReferableArray(posts);
      bodyscope.posts.sort((p1, p2)=>{
        if(p1.time < p2.time){
          return 1;
        }else if(p1.time > p2.time){
          return -1;
        }else{
          return 0
        }
      });
      bodyscope.postsDual = {};
      bodyscope.posts.forEach((p)=>{
        bodyscope.postsDual[p.___id___] = p;
      });
      if(bodyscope.viewMode == 'targetPost'){
        if(bodyscope.postsDual != undefined){
          if(bodyscope.query){
            bodyscope.post = bodyscope.postsDual[bodyscope.query];
          }
        }
      }
      if(bodyscope.viewMode == 'tagSearch'){
        if(bodyscope.postsDual != undefined){
          if(bodyscope.query){
            bodyscope.filteredPosts = bodyscope.posts.filter((p)=>{
              return p.tags.includes(decodeURI(bodyscope.query));
            });
            bodyscope.showContent = false;
          }
        }
      }
      if(bodyscope.viewMode == 'search'){
        if(bodyscope.postsDual != undefined){
          if(bodyscope.query){
            bodyscope.filteredPosts = bodyscope.posts.filter((p)=>{
              return (p.tags.includes(decodeURI(bodyscope.query)) || p.content.includes(decodeURI(bodyscope.query)) || p.title.includes(decodeURI(bodyscope.query)));
            });
          }
        }
      }
    }
  }
  var app = angular.module('mainApp', []);
  app.controller("bodyController", [
    '$scope',
    function($scope){
      bodyscope = $scope;
      $scope.viewMode = window.location.search==''?'normal':(window.location.search.startsWith('?s=')?'search':(window.location.search.startsWith('?p=')?'targetPost':(window.location.search.startsWith('?t=')?'tagSearch':'notFound')));
      if($scope.viewMode != 'normal' && $scope.viewMode != 'notFound'){
        $scope.query = window.location.search.replace(/\?(s|t|p)\=/,'');
        $scope.search = window.location.search.match(/\?(.*)(\=(.*))?/)[1];
      }else{
        $scope.query = '';
        if($scope.viewMode == 'notFound'){
          $scope.search = window.location.search.match(/\?(.*)(\=(.*))?/)[1];
        }else{
          $scope.search = '';
        }
      }
      $scope.showContent = true;
      $scope.users = [];
      $scope.posts = [];
      $scope.postsOriginal = {};
      $scope.filteredPosts = [];
      $scope.loggedIn = false;
      $scope.currentUser = currentUser;
      $scope.rememberMe = window.localStorage.getItem('persistence')=='local'?true:false;
      $scope.fbSetPersistence = function(state){
        switch(state){
          case true:
            persistence = firebase.auth.Auth.Persistence.LOCAL;
            break;
          case false:
            persistence = firebase.auth.Auth.Persistence.SESSION;
            break;
        }
        window.localStorage.setItem('persistence', persistence);
      };
      $scope.header = {
        url: '/header.html'
      };
      $scope.footer = {
        url: '/footer.html'
      };
      $scope.sidebar = {
        url: '/sidebar.html'
      };
    }
  ]);
  firebase.database().ref('posts').on('value', function(v){updatePosts(v.val());});
  firebase.database().ref('admins').on('value', function(v){
    if(bodyscope != undefined){
      bodyscope.admins = v.val();
    }
  });
  window.addEventListener('load', function(){
    let _queryObject = window.location.search.split(/\?|\&/g).reverse();
    let queryObject = {};
    _queryObject.pop();
    _queryObject = _queryObject.reverse();
    _queryObject.forEach((k)=>{
        let kvp = k.split('=');
        queryObject[kvp[0]] = kvp[1];
    });
    window.location.query = queryObject;
    let checklist = {
      'listeningToLogin': false,
      'listeningToLogout': false,
      'retrievedPersistence': false
    };
    setInterval(function(){
      if(document.querySelector("#lgin") && !checklist.listeningToLogin){
        document.querySelector("#lgin").addEventListener('click', login, false);
        checklist.listeningToLogin = true;
      }
      if(document.querySelector("#lgout") && !checklist.listeningToLogout){
        document.querySelector("#lgout").addEventListener('click', logout, false);
        checklist.listeningToLogout = true;
      }
      if(!checklist.retrievedPersistence){
        if(!window.localStorage.getItem('persistence')){
          window.localStorage.setItem('persistence', firebase.auth.Auth.Persistence.SESSION);
        }
        persistence = window.localStorage.getItem('persistence');
        checklist.retrievedPersistence = true;
      }
      updateScope(bodyscope);
    }, 1000);
  }, false);
})();