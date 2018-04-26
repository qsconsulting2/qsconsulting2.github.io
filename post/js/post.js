(function Post(){
    function _createPost(title, content, tags){
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
    let myEditor;
    bkLib.onDomLoaded(function(){
        myEditor = new nicEditor({fullPanel : true }).panelInstance('textarea-create-post');
    });
    window.addEventListener('load', function(){
        let submit_post = document.querySelector('#submitPost');
        let post_title = document.querySelector('#postTitle');
        let post_tags = document.querySelector('#postTags');
        post_tags.setAttribute('title', 'Tags are separated by a comma')
        submit_post.addEventListener('click', function(){
            let post_content = myEditor.instanceById('textarea-create-post').getContent();
            _createPost(post_title.value, post_content, post_tags.value.replace(/, /g,',').split(','));
        }, false);
    }, false);
})();