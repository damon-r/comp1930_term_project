
$(document).ready(function() {
  // = = = = = Define Variables = = = = =
  var user;
  var currentUserEmail;
  var userList = {};
  const database = firebase.database();
  
  //listens for user authentication status change.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var currentUserUid = user.uid;
      var currentUserRef = database.ref('users/' + currentUserUid);
      setUsername(currentUserRef);
      console.log('currentUserUid: ' + currentUserUid);
    } else {

      console.log('user not logged in');
    }
  });


  // //Add yourself to the array.
  // setTimeout(function() {
  //   var uid = firebase.auth().currentUser.uid;
  //   userCount = 1; //How many users are in the room. Defaults to 1, because you're kinda making it.
  //   currentUserRef = database.ref('users/' + uid);
  //   currentUserDisplay = setUsername(currentUserRef);
  //   userList = new Array(currentUserDisplay); //An array to hold usernames.
  //   console.log(currentUserDisplay);
  //   console.log(userList);
  // }, 500);
  // console.log(userCount +  userList);

  //sets the user name on the top right cornner.
  function setUsername(currentUserRef) {
    currentUserRef.once('value').then(function(snapshot) {
        var userName = snapshot.child('displayName').val();
        $('#profileName').text(userName);
        return userName;
    });
  }
  
  // = = = = = Button Events = = = = =
  //Spawn new list items on click, assuming a name is typed.
  $("#addPerson").click(function() {
    var nameOfAdded = $("#personToAdd").val();
    if ($.trim(nameOfAdded).length != 0) {
      $('#error').text('');
      userList[nameOfAdded] = true;
      $("#userList").append(
        "<div class='person'>" +
        "<p class='personName'>"+ nameOfAdded + "</p>" +
          "<div class='deleteButton'><span>&times</span></div></div>");
          
      $("#personToAdd").val("");
    } else {
        $('#error').text('Please enter an email address.');
    }
    console.log(userList);
  });

  //Alternatively for #addPerson, listen for enter presses.
  $("#personToAdd").on("keypress", function(e) {
      if (e.which === 13) {
      $("#addPerson").click();
      }
  });

  //Delete stuff on delete button press.
  $(document).on("click", ".deleteButton", function() {
      var nameWithin = $(this).closest(".person").children("p").text();
      //var position = $.inArray(nameWithin, userList, 0);

      //Edit array.
      // userList[position] = "";
      // userList = userList.filter(trimArray);
      delete userList[nameWithin];
      console.log(userList);
      $(this).closest(".person").remove();
  });

    //Create room on click.
  $("#createRoom").click(function(event){

      //Check if the name is filled.
      if ($("#roomName").val() != "") {
          let inputName = $("#roomName").val();
          let inputDesc = $("#roomDesc").val();
          let inputImage = $("#roomImage").val();
          writeUserData(inputName, inputDesc, inputImage);
          
      } else {
          alert("Your room requires a name!");
      }
  });

  // = = = = = Add to Database = = = = =
  //Adds the room to the database.
  function writeUserData(inputName, inputDesc, inputImage) {
      var newGroupUid = database.ref().child('groups').push().key;
      console.log(newGroupUid);
      firebase.database().ref('groups/' + newGroupUid).set({
          dateCreated: getCurrentDate(),
          title: inputName,
          description: inputDesc,
          roomImage: inputImage,
          memberCounts: userList.length + 1,
          memberInfo: userList,
      });
      window.location.href="./chat_room.html#" + newGroupUid;
  }

  //==========get current date function, eg. Nov 20, 2018.=================
  function getCurrentDate() {
      var monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
      "Nov", "Dec"
      ];
      var currentDate = new Date();
      var date = currentDate.getDate();
      var month = currentDate.getMonth();
      var year = currentDate.getFullYear();
      return monthNames[month] + " " + date + ", " + year;
  }

  // // = = = = = Trim Array = = = = =
  // //A thing used to determine what to put in the new array.
  // function trimArray(name) {
  //     return name != "";
  // }

});