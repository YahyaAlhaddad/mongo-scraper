$(document).ready(function () {
 //sticky navbar  
 $(window).on("scroll", function () {
    if ($(window).scrollTop()) {
        $("#nb").addClass("sticky")
    } else {
        $("#nb").removeClass("sticky")
    }
});
// Call a function to load the page
    loadSavedArticles();
    // saved articles display element
    $(document).on("click", ".btn.delete",function(){
      // This function handles deleting articles/headlines
      // We grab the id of the article to delete from the panel element the delete button sits inside
      var articleToDelete = $(this).parents(".panel").data();
      // Using a delete method here just to be semantic since we are deleting an article/headline
      $.ajax({
        method: "DELETE",
        url: "/api/headlines/" + articleToDelete._id
      }).then(function(data) {
        // If this works out, run initPage again which will rerender our list of saved articles
        if (data.ok) {
          initPage();
        }
      });
    });

    $(document).on("click", ".btn.notes", function (){
      // This function handles opending the notes modal and displaying our notes
      // We grab the id of the article to get notes for from the panel element the delete button sits inside
      var currentArticle = $(this).parents(".panel").data();
      // Grab any notes with this headline/article id
      $.get("/api/notes/" + currentArticle._id).then(function(data) {
        // Constructing our initial HTML to add to the notes modal
        var modalText = [
          "<div class='container-fluid text-center'>",
          "<h4>Notes For Article: ",
          currentArticle._id,
          "</h4>",
          "<hr />",
          "<ul class='list-group note-container'>",
          "</ul>",
          "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
          "<button class='btn btn-success save'>Save Note</button>",
          "</div>"
        ].join("");
        // Adding the formatted HTML to the note modal
        bootbox.dialog({
          message: modalText,
          closeButton: true
        });
        var noteData = {
          _id: currentArticle._id,
          notes: data || []
        };
        // Adding some information about the article and article notes to the save button for easy access
        // When trying to add a new note
        $(".btn.save").data("article", noteData);
        // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
        renderNotesList(noteData);
      });
    });
    });
    $(document).on("click", ".btn.save",function (){
      // This function handles what happens when a user tries to save a new note for an article
      // Setting a variable to hold some formatted data about our note,
      // grabbing the note typed into the input box
      var noteData;
      var newNote = $(".bootbox-body textarea").val().trim();
      // If we actually have data typed into the note input field, format it
      // and post it to the "/api/notes" route and send the formatted noteData as well
      if (newNote) {
        noteData = {
          _id: $(this).data("article")._id,
          noteText: newNote
        };
        $.post("/api/notes", noteData).then(function() {
          // When complete, close the modal
          bootbox.hideAll();
        });
      }
    });
    
    $(document).on("click", ".btn.note-delete", function(){
      // This function handles the deletion of notes
      // First we grab the id of the note we want to delete
      // We stored this data on the delete button when we created it
      var noteToDelete = $(this).data("_id");
      // Perform an DELETE request to "/api/notes/" with the id of the note we're deleting as a parameter
      $.ajax({
        url: "/api/notes/" + noteToDelete,
        method: "DELETE"
      }).then(function() {
        // When done, hide the modal
        bootbox.hideAll();
      });
    });   
  
    function loadSavedArticles() {
      // Empty the article container, run an AJAX request for any saved headlines
      // articleArea.empty();
      $.getJSON("/articles?saved=false", function(data) {
        // If we have headlines, render them to the page
        if (data && data.length) {
          renderArticles(data);
        }
        else {          
          alert("There are no saved articles");
        }
      });
    }
    var articleArea = $(".main-content");
    function renderArticles(articles) {
      
      var articlePanels = [];
      // We pass each article JSON object to the createPanel function which returns a bootstrap
      // panel with our article data inside
      for (var i = 0; i < articles.length; i++) {
        articlePanels.push(createPanel(articles[i]));
      }
      // Once we have all of the HTML for the articles stored in our articlePanels array,
      // append them to the articlePanels container
      articleArea.append(articlePanels);
    }
  
    function createPanel(article) {
      // This functiont takes in a single JSON object for an article/headline
      // It constructs a jQuery element containing all of the formatted HTML for the
      // article panel
      var panel = $(
        [
          "<div class='panel panel-default'>",
          "<div class='panel-heading'>",
          "<h3>",
          "<a class='article-link' target='_blank' href='" + article.link + "'>",
          article.title,
          "</a>",
          "<a class='btn btn-danger delete'>",
          "Delete From Saved",
          "</a>",
          "<a class='btn btn-info notes'>Article Notes</a>",
          "</h3>",
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

    function renderNotesList(data) {
      // This function handles rendering note list items to our notes modal
      // Setting up an array of notes to render after finished
      // Also setting up a currentNote variable to temporarily store each note
      var notesToRender = [];
      var currentNote;
      if (!data.notes.length) {
        // If we have no notes, just display a message explaing this
        currentNote = ["<li class='list-group-item'>", "No notes for this article yet.", "</li>"].join("");
        notesToRender.push(currentNote);
      }
      else {
        // If we do have notes, go through each one
        for (var i = 0; i < data.notes.length; i++) {
          // Constructs an li element to contain our noteText and a delete button
          currentNote = $(
            [
              "<li class='list-group-item note'>",
              data.notes[i].noteText,
              "<button class='btn btn-danger note-delete'>x</button>",
              "</li>"
            ].join("")
          );
          // Store the note id on the delete button for easy access when trying to delete
          currentNote.children("button").data("_id", data.notes[i]._id);
          // Adding our currentNote to the notesToRender array
          notesToRender.push(currentNote);
        }
      }
      // Now append the notesToRender to the note-container inside the note modal
      $(".note-container").append(notesToRender);
    }
      
    function handleNoteSave() {
      // This function handles what happens when a user tries to save a new note for an article
      // Setting a variable to hold some formatted data about our note,
      // grabbing the note typed into the input box
      var noteData;
      var newNote = $(".bootbox-body textarea").val().trim();
      // If we actually have data typed into the note input field, format it
      // and post it to the "/api/notes" route and send the formatted noteData as well
      if (newNote) {
        noteData = {
          _id: $(this).data("article")._id,
          noteText: newNote
        };
        $.post("/api/notes", noteData).then(function() {
          // When complete, close the modal
          bootbox.hideAll();
        });
      }
    }