function onAddFavBook(favBook) {
    // debugger;
    console.log(favBook);
      
        fetch(`/clicked/${favBook.bookid}`, {method: 'POST'})
          .then(function(response) {
            if(response.ok) {
              console.log('Click was recorded');
              alert("Book Added to Favourite List Successfully !!!");
              return;
            }    
            throw new Error('Request failed.');
          })
          .catch(function(error) {
            console.log(error);
          });
}

/*
    The function formSubmit() is called when the form "myform" is submitted.
    It runs some validations and shows the output.
*/
function formSubmit(){

    // return true; // uncomment this line to bypass the validations

    var myOutput = ''; // we will use this to store the output of the form
    var errors = ''; // we will use this to store any error messages.
    
    // Fetching the values of all the fields entered by the user.

    // Using getElementById for most of the fields as they have just one
    // input field unlike radio buttons which have multiple.
    var title = document.getElementById('title').value;
    var author = document.getElementById('author').value;
    var genre = document.getElementById('genre').value;
    var bimg = document.getElementById('bimg').value;
    
    if(bimg != ''){ // Returns true if phone satisfies the pattern
        errors += ''; // No error in phone
    }
    else{
        // Error found in phone; concatenating to the existing list of errors
        errors += 'Please upload the Book Image'; 
    }

    // Comparing the errors string if any errors were found.
    if(errors.trim() != ''){ // trim is the function that trims any empty spaces from front or back
        // Showing the errors
        document.getElementById('errors').innerHTML = errors + '-- Please fix the above errors --';
        document.getElementById('errors').style.border = '2px dashed white';
    }
    else{
        // If no errors found
        // Preparing the myOutput
        myOutput = `Title: ${title} <br>
                    Author: ${author} <br>
                    Genre: ${genre}<br>
                    Image: ${bimg}<br>
                    `;
        // removing any error messages
        document.getElementById('errors').innerHTML = '';
        document.getElementById('errors').style.border = '0px';
        // Showing the values put in by the user and the total cost
        //document.getElementById('formResult').innerHTML = myOutput;
    }

    // Return false will stop the form from submitting and keep it on the current page.
    // return false;
}