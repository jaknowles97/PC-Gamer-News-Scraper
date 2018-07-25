$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      // $("#articles").append("<div data-id='" + data[i]._id + "'>" + data[i].title + "<a href='" + data[i].link + "'>click here to view source<a/></div>");
      $("#articles").append(
          `<div class='article' data-id= ${data[i]._id} > <h3> ${data[i].title} </h3>
            <a href=' ${data[i].link}'> click to go to source </a>
            <p> ${data[i].author} </p>
          </div>`);
    }
  });



$(document).on("click", ".article", function(e) {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        console.log(data);
        let notesHTML = "<section class='noteTable'><h3>What the people have to say</h3>";
        for(var i = 0; i < data.notes.length; i++) {
          notesHTML += "<div class='comment'><h4>"+ data.notes[i].title+ "</h4><p>"+ data.notes[i].body+ "</p></div>";
        }
        $("#notes").prepend(notesHTML);
      });
  });
  
  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({

      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });