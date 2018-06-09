$.getJSON('/articles', function(data) {
    console.log (data.length);
    for (var i = 0; i<data.length; i++){
      var newPanel = createPanel(data[i]);
    
    $("#articles-area").append(newPanel);
    $("#articles-area").append($("<hr>"));
    }
  });
  function createPanel(article) {
    var panel = $(
      [
        "<div class='panel panel-default'>",
        "<div class='panel-heading'>",
        "<h4>",
        "<a class='article-link' target='_blank' href='" + article.link + "'>",
        article.title,
        "</a>",
        "<a class='btn btn-success save'>",
        "Save Article",
        "</a>",
        "</h4>",
        "</div>",
        "<div class='panel-body'>",
        article.summary,
        "</div>",
        "</div>"
      ].join("")
    );
    panel.data("_id", article._id);
    return panel;
  }
  $(document).on("click", ".btn.save", function(){
    var thisId = $(this).attr("data-id");
      // Using a patch method to be semantic since this is an update to an existing record in our collection
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          title: $(".article-link").val(),
          link: $(".article-link").href
        }
      }).then(function(data) {
        
        if (data.ok) {
          // Run the initPage function again. This will reload the entire list of articles
          loadArticles();
        }
      });
    });
  // whenever someone clicks a p tag[]
  $(document).on("click", "p", function(){
    // empty the notes from the note section
    $('#notes').empty();
    // save the id from the p tag
    var thisId = $(this).attr('data-id');
  
    // now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId,
    })
      // with that done, add the note information to the page
      .done(function( data ) {
        console.log(data);
        // the title of the article
        $('#notes').append('<h4>' + data.title + '</h4>'); 
        // an input to enter a new title
        $('#notes').append('<input id="titleinput" name="title" >'); 
        // a textarea to add a new note body
        $('#notes').append('<textarea id="bodyinput" name="body"></textarea>'); 
        // a button to submit a new note, with the id of the article saved to it
        $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');
  
        // if there's a note in the article
        if(data.note){
          // place the title of the note in the title input
          $('#titleinput').val(data.note.title);
          // place the body of the note in the body textarea
          $('#bodyinput').val(data.note.body);
        }
      });
  });
  
  // when you click the savenote button
  $(document).on('click', '#savenote', function(){
    // grab the id associated with the article from the submit button
    var thisId = $(this).attr('data-id');
  
    // run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $('#titleinput').val(), // value taken from title input
        body: $('#bodyinput').val() // value taken from note textarea
      }
    })
      // with that done
      .done(function( data ) {
        // log the response
        console.log(data);
        // empty the notes section
        $('#notes').empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $('#titleinput').val("");
    $('#bodyinput').val("");
  });