(function Post(){
    function createPost(title, content, tags){
        let fbRef = firebase.database().ref('posts');
        let postID = fbRef.push().key;
        let postData = {
            "title": title,
            "content": content,
            "tags": tags,
            "time": Date.now(),
            "views": 0
        };
        fbRef.child(postID).set(postData);
    }
    function updatePost(title, content, tags, post_time, post_views, _postID){
        let fbRef = firebase.database().ref('posts');
        let postID = _postID;
        let postData = {
            "title": title,
            "content": content,
            "tags": tags,
            "time": post_time,
            "views": 0
        };
        fbRef.child(postID).set(postData);
    }
    let myEditor;
    bkLib.onDomLoaded(function(){
        myEditor = new nicEditor({fullPanel : true }).panelInstance('textarea-create-post');
    });
    window.addEventListener('load', function(){
        let submit_post = document.querySelector('#submitPost');
        let post_title = document.querySelector('#postTitle');
        let post_tags = document.querySelector('#postTags');
        let post_time;
        let post_views;
        let _postID_;
        post_tags.setAttribute('title', 'Tags are separated by a comma');
        if(window.location.query.postid != undefined){
            firebase.database().ref(`posts/${window.location.query.postid}`).once('value', (v)=>{
                let _post = v.val();
                if(_post != null){
                    submit_post.innerHTML = "Update";
                    myEditor.instanceById('textarea-create-post').setContent(_post.content);
                    post_title.value = _post.title;
                    post_tags.value = _post.tags.join(', ');
                    post_time = _post.time;
                    post_views = _post.views;
                    _postID_ = window.location.query.postid;
                }
            });
        }
        submit_post.addEventListener('click', function(){
            if(window.location.query.postid != undefined){
                let post_content = myEditor.instanceById('textarea-create-post').getContent();
                updatePost(post_title.value, post_content, post_tags.value.replace(/, /g,',').split(','), post_time, post_views, window.location.query.postid);
                myEditor.instanceById('textarea-create-post').setContent('<br/>');
                submit_post.innerHTML = "Submit";
            }else{
                let post_content = myEditor.instanceById('textarea-create-post').getContent();
                createPost(post_title.value, post_content, post_tags.value.replace(/, /g,',').split(','));
                myEditor.instanceById('textarea-create-post').setContent('<br/>');
                submit_post.innerHTML = "Submit";
            }
        }, false);
    }, false);
})();