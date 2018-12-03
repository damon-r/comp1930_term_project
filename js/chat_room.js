$(document).ready(function() {
  //Defining firebase variables
  const database = firebase.database();
  const rootRef = database.ref();

  var currentUserName;

  $('#create_agenda_modal').hide();

  //parses the url address and get the currentGroupUid.
  var url = document.location.href;
  var currentGroupUid = url.split('#')[1];
  console.log('url parsed from the url: ' + currentGroupUid);
  var messages = firebase.database().ref('groups/'+currentGroupUid+'/messages');

  var today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, 0);
  const day = `${today.getDate()}`.padStart(2, 0);
  const stringToday = [year, month, day].join('-');
  console.log(stringToday);

  //sets minimum date for the dueDate of a new agenda, which cannot be smaller
  //than today.
  $('#dueDate').attr('min',stringToday);
  //sets the default date for a new agenda to today.
  $('#dueDate').attr('value', stringToday);
  
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('calling setGroupTitle function...');
      setGroupTitle(currentGroupUid);
      console.log('onAuthStateChanged: ' + user.uid);
      var currentUserRef = database.ref('users/' + user.uid);
      console.log('calling setUsername function...');
      setUsername(currentUserRef);
      console.log('calling loopForGroupAgendas function...');
      loopForGroupAgendas(currentGroupUid);
      console.log('calling loopForGroupMembers function...');
      loopForGroupMembers(currentGroupUid);
      
    } else {
      window.location.href = "./index.html";
      console.log('user not logged in');
    }
  });

   //Store the current user's display name and ID in local variables
   var currentUserID;
   setTimeout(function() {
     currentUserID = firebase.auth().currentUser.uid;
     currentUserName = firebase.auth().currentUser.displayName;
     console.log('currentUserID(setTimeout): ' + currentUserID);
//     return currentUserID;
     console.log(currentUserName);
   }, 1000);
   console.log('currentUserID: ' + currentUserID);

  //sets the group title on the top left cornner.
  function setGroupTitle(currentGroupUid) {
    rootRef.once('value').then(function(snapshot) {
        var groupTitle = snapshot.child('groups/' + currentGroupUid + '/title').val();
        $('#room').text(groupTitle);
        console.log('setGroupTitle function called.');
    });
  }

  //sets the user name on the top right cornner.
  function setUsername(currentUserRef) {
    currentUserRef.once('value').then(function(snapshot) {
        var userName = snapshot.child('displayName').val();
        $('#profileName').text(userName);
        console.log('setUsername function called.');
    });
  }

  //================retrive and append agenda section================
  //retrieves each agendaUid under a group, one at a time. It then passes the //agendaUid to the function that uses Jquery to display name dynamicly.
  function loopForGroupAgendas(currentGroupUid) {
    database.ref('groups/' + currentGroupUid + '/agendas/').once('value').then(function(snapshot) {
      var contains = snapshot.exists();
      console.log('any data here: ' + currentGroupUid + ' '+ contains);
      if (!contains) {
        $('#agendaSpace').text('No Agendas Yet.');
        console.log('No agenda data.');
      } else {
        console.log('Start looping for agendas.');
        $('#agendaSpace').text('');
        snapshot.forEach(function(childSnapshot) {
        var uid = childSnapshot.key;
        retrieveAgendaInfo(uid);
      });
      }

    });
  }

  //var ref = database.ref('agendas').orderByChild('dueDate');
  function retrieveAgendaInfo(agendaUid) {
    database.ref('agendas/' + agendaUid).once('value').then(function(snapshot) {
      console.log(agendaUid);
      var contains = snapshot.exists();
      if (!contains) {
        console.log('no info under agenda: ' + agendaUid);
      } else {
      var dataObj = {
          //assignedTo: snapshot.child('assignedTo').val(),
          description: snapshot.child('description').val(),
          dueDate: snapshot.child('dueDate').val(),
          dueTime: snapshot.child('dueTime').val(),
        };
        console.log('agendas Retieved..');
        console.log('Retrieved obj: ' + dataObj);
      }
      addAAgendaList(agendaUid, dataObj);
    });
  }
  //================end of the section================

  //=================dynamic group members listing section=============
  //retrieves each memberUid under a group, one at a time. It then passes the //memberUid to the function that uses Jquery to display name dynamicly.
  function loopForGroupMembers(currentGroupUid) {
    database.ref('groups/' + currentGroupUid +'/memberInfo').once('value').then(function(snapshot) {
      var contains = snapshot.exists();
      console.log('any member here: ' + currentGroupUid + ' '+ contains);
      if (!contains) {
        console.log('No group member data.');
      } else {
        console.log('Start looping for group members.');
        snapshot.forEach(function(childSnapshot) {
          var memberUid = childSnapshot.key;
          console.log('memberUid: '+ memberUid);
          retrieveGroupMemberName(memberUid);
        });
      }
    });
  }

  //accepts a uid of each member under a group. it then uses the uid to retrieve
  //and store the displayName under that uid. finally, it adds that displayName
  //into the user list to whom a task can be assign.
  function retrieveGroupMemberName(uid) {
    database.ref('users/' + uid).once('value').then(function(snapshot) {
      var isThere = snapshot.exists();
      if (isThere) {
        var memberName = snapshot.child('displayName').val();
        console.log('member name: '+ memberName);
        var newLabel = $('<label></label>');
        newLabel.text(memberName);
        newLabel.addClass('floatClearRight members');
        var newCheckbox = $('<input/>');
        newCheckbox.attr('value', uid + '#' + memberName);
        console.log('input value: '+ uid);
        newCheckbox.attr('type', 'checkbox');
        newCheckbox.addClass('nameCheckbox');
        newLabel.append(newCheckbox);
        $('#agendaDesc').after(newLabel);
        console.log('group member: ' + uid + ' Retieved..');
      } else {
        console.log('user hasn\'t joined projectHub yet');
      }
      
    });
  }
  //========================end of a section======================

  //==================create and update agenda info section====================


  //accepts a json object containing all the agenda info and generates
  //a random key assigned to that agenda. lastly, updates these info under the
  //currentGroupUid, the 'agendas' node, and the users to whom the agenda is
  //assigned.
  function updatingANewAgenda(currentGroupUid, newAgenda_description, newAgenda_dateDue, newAgenda_timeDue, prefix, newAgenda_memberObj) {
    console.log(currentGroupUid+ newAgenda_description+ newAgenda_dateDue+ newAgenda_timeDue+ prefix+ newAgenda_memberObj);
    database.ref('groups/').once('value').then(function(snapshot) {
    //check if the passing in currentGroupUid exists or not.
      var contains = snapshot.child(currentGroupUid).exists();
      if (!contains) {
          console.log('Group Not Found');
      } else {
        // A new group
        var newAgendaData = {
          description: newAgenda_description,
          dueTime: newAgenda_timeDue,
          dueDate: newAgenda_dateDue,
          done: false,
          assignedTo: newAgenda_memberObj,
        };
        // Get a key for a new group.
        var newAgendaUid = prefix + rootRef.child('agendas').push().key;
        console.log('new key for agenda:' + newAgendaUid);
        console.log('new agenda data' + newAgendaData);
        // Write the new group's data simultaneously in the groups list and the
        //user's group list.
        var updates = {};
        updates['agendas/' + newAgendaUid] = newAgendaData;
        updates['groups/' + currentGroupUid + '/agendas/'  + newAgendaUid] = true;
        for (var key in newAgenda_memberObj) {
          console.log(key);
          updates['users/' + key + '/agendas/'  + newAgendaUid] = true;
        }
        console.log('------>updating Agenda completed<---------');

        addAAgendaList(newAgendaUid, newAgendaData);
        return rootRef.update(updates);
      }
    });
  }

  //accepts a date object and returns eaquavilent date in two diffenrent forms.
  //eg. 20181120 if 'digital' value is true, or Nov 20, 2018 otherwise.
  function getCurrentDate(getDate, digital) {
    var monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];
    var currentDate = new Date(getDate);
    var date = currentDate.getDate() + 1;
    var month = currentDate.getMonth();
    var year = currentDate.getFullYear();
    if (digital == true) {
      return "" + year + (month + 1) + date;
    } else {
      return monthNames[month] + " " + date + ", " + year;
    }
  }

  //accepts
  function addAAgendaList(agendaUid, {description, dueDate, dueTime}) {
    console.log(agendaUid + description + dueDate + dueTime);
    var div_agendas = $('<div></div>');
    div_agendas.attr('id', agendaUid);
    div_agendas.addClass('agendas');
    // var h2_groupTitle = $('<h2></h2>');
    // h2_groupTitle.text("");
    //div_agendas.append(h2_groupTitle);
    //need to loop this
    var div_individualAgenda = $('<div></div>');
    div_individualAgenda.addClass(agendaUid + ' individualAgenda');
    var h4_agendaDesc = $('<h4><//h4>');
    h4_agendaDesc.addClass('agendaDesc');
    h4_agendaDesc.text(description);
    //h4_agendaDesc.text(agendaUid);
    var p_agendaDesc = $('<p></p>');
    p_agendaDesc.text("Due: ");
    p_agendaDesc.addClass('agendaDesc');
    var span_date = $('<span></span>');
    span_date.text(dueDate + " @ ");
    var span_time = $('<span></span>');
    span_time.text(dueTime);
    p_agendaDesc.append(span_date, span_time);
    div_individualAgenda.append(h4_agendaDesc, p_agendaDesc);
    div_agendas.append(div_individualAgenda);

    database.ref('agendas/' + agendaUid ).once('value').then(function(snapshot) {
      var hasCanceledBy = snapshot.child('canceledBy').exists();
      var done = snapshot.child('done').val();
      console.log('testing.......,' + agendaUid + hasCanceledBy);
      if (hasCanceledBy) {
        h4_agendaDesc.css('text-decoration', 'line-through');
        p_agendaDesc.css('text-decoration', 'line-through');
        var by = snapshot.child('canceledBy').val();
        var div_canceledBy = $('<div></div>');
        div_canceledBy.html('Canceled By <br/>' + by);
        div_agendas.append(div_canceledBy);
      } else if (done == true) {
        var doneBy = snapshot.child('assignedTo').val();
        h4_agendaDesc.css('color', 'grey');
        p_agendaDesc.css('color', 'grey');
        var div_doneBy = $('<div></div>');
        var s = '';
        for (var key in doneBy) {
          if (doneBy.hasOwnProperty(key)) {
            s += doneBy[key] + ', ';
          }
        }
        s = s.substring(0, s.length - 2);
        div_doneBy.html('Completed By <br/>' + s);
        div_agendas.append(div_doneBy);
      } else {
        var div_agendaIcons = $('<div></div>');
        div_agendaIcons.addClass('agendaIcons');
        var img_cancel = $('<img/>');
        img_cancel.addClass(agendaUid + ' cancelIcons');
        img_cancel.attr('src', './images/cross.png');
        img_cancel.attr('alt', 'Cancel Icon');
        var img_done = $('<img/>');
        img_done.addClass(agendaUid + ' doneIcons');
        img_done.attr('src', './images/check-border.png');
        img_done.attr('alt', 'Check Icon');
        div_agendaIcons.append(img_cancel, img_done);
        div_agendas.append(div_agendaIcons);
      }
    });
    $('#agendaSpace').prepend(div_agendas);
    console.log('agenda added.');
  }
  //========================end of a section======================

  //removes given agendaUid under "users" and "agendas" nodes in the database.
  function removeAgendaInfoFromDatabase(agendaUid) {
    database.ref('agendas/' + agendaUid).child('assignedTo').once('value').
    then(function(snapshot) {
      var userObj = snapshot.val();
      for (var key in userObj) {
        console.log('key: ' + key + ' ' + userObj);
        database.ref('users/' + key + '/agendas/' + agendaUid).remove();
      }
    });
    var currentUserUid = firebase.auth().currentUser.uid;
    database.ref('users/' + currentUserUid + '/displayName').once('value').then(function(snapshot) {
      var updates = {};
      var name = snapshot.val();
      updates['agendas/' + agendaUid + '/canceledBy'] = name;
      rootRef.update(updates);
    });
    
    console.log('removeAgendaInfoFromDatabase function called.');
  }
  //=========end of the function=======================


  //=====================event handling section=====================
  //clicks the plus sign to see or close the "create an agend" drop down.
  var isDown = false;
  $('#createAgendaIcon').click(function(e) {
    e.preventDefault();
    if (!isDown) {
      $('#createAgendaIcon').css('transform', 'rotate(135deg)');
      $("#create_agenda_modal").slideDown();
      isDown = true;
    } else {
      $('#createAgendaIcon').css('transform', 'rotate(-90deg)');
      $("#create_agenda_modal").slideUp();
      isDown = false;
    }
  });

  //logs current user out.
  $('#logout').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    firebase.auth().signOut();
  });

  //clicks the create button on the create agenda modal will write all the value
  //in the input boxes to the database and hides the interface.
  $('#newAgendaForm').submit(function getAgendaInfo() {
    var agendaDescription = $('#agendaDesc').val();
    var agendaDueDate = getCurrentDate($('#dueDate').val(), false);
    var agendaDueTime = $('#dueTime').val();
    //prefix will be added to the beginning of a random generated key.
    //ithelps to sort the agenda according to due time.
    var prefix = getCurrentDate($('#dueDate').val(), true) + agendaDueTime;
    var assignedTo = {};
    //store values of the checked box in 'assigned' object.
    if ($('.nameCheckbox:checked').length <= 0) {
      alert('You must assign at least one member to this task.');
    } else {
      $('.nameCheckbox:checked').each(function iterator(){
        var [value, name] = $(this).val().split('#');
        assignedTo[value] = name;
      });
      console.log(agendaDescription + agendaDueDate + agendaDueTime + prefix + assignedTo);
      updatingANewAgenda(currentGroupUid, agendaDescription, agendaDueDate, agendaDueTime, prefix, assignedTo);
      $('#createAgendaIcon').css('transform', 'rotate(-90deg)');
      $("#create_agenda_modal").slideUp();
    }
  });

  $(document).on('click', '.cancelIcons', function() {
    var classes = $(this).attr('class').split(' ');
    var agendaUid = classes[0];
    if (confirm("Are you sure you want to cancel this agenda?")) {
      console.log('deleting agenda: '+ agendaUid);
      document.getElementsByClassName(agendaUid)[0].style.textDecoration = 'line-through';
      document.getElementsByClassName(agendaUid)[1].style.display = 'none';
      document.getElementsByClassName(agendaUid)[2].style.display = 'none';
      console.log('calling removeAgendaInfoFromDatabase...');
      removeAgendaInfoFromDatabase(agendaUid);
    }
  });

  $(document).on('click', '.doneIcons', function() {
    var classes = $(this).attr('class').split(' ');
    var agendaUid = classes[0];
    var markTrue = {};
    markTrue['agendas/' + agendaUid + '/done'] = true;
    rootRef.update(markTrue);
    document.getElementsByClassName(agendaUid)[0].style.color = 'grey';
    document.getElementsByClassName(agendaUid)[1].style.display = 'none';
    document.getElementsByClassName(agendaUid)[2].style.display = 'none';
    console.log('checking agenda: '+ agendaUid);
    
  });
  //=====================end of the event handling section=====================


  //Prints out messages stored in database
  setTimeout(function() {
    console.log('starting adding messages..............');
    messages.on('child_added', function(snapshot) {
      let key = snapshot.key;
      console.log(key + '----------');

      let messageRef = firebase.database().ref('groups/'+currentGroupUid+'/messages/'+key+'/message');
      let messageUserRef = firebase.database().ref('groups/'+currentGroupUid+'/messages/'+key+'/messageUser');
      let messageUserNameRef = firebase.database().ref('groups/'+currentGroupUid+'/messages/'+key+'/messageUserName');

      let messageValue;
      let messageUser;
      let messageUserName;

      let messagePromise = messageRef.once('value', function(m) {
        messageValue = m.val();
      });
      let messageUserPromise = messageUserRef.once('value', function(m) {
        messageUser = m.val();
      });
      let messageUserNamePromise = messageUserNameRef.once('value', function(m) {
        messageUserName = m.val();
      });

      Promise.all([messagePromise, messageUserPromise, messageUserNamePromise]).then(function() {
        console.log(messageValue);
        console.log(messageUser);
        console.log(messageUserName);


        if (messageUser == currentUserID) {
          var content = $("<p class='ph'>" +messageValue+ "</p>");
          var userImage = $("<img class='userImage' src='./images/profile-blue-background.png'>");
          var userName = $("<span class='userName'>Username</span>");
          var user = $("<div class='user'></div>");
          var message = $("<div class='message'></div>");
          var messageBox = $("<div class='messageBox'></div>");
        } else {
          var content = $("<p class='ph2'>" +messageValue+ "</p>");
          var userImage = $("<img class='userImage2' src='./images/profile-orange.png'>");
          var userName = $("<span class='userName2'>Username</span>");
          var user = $("<div class='user2'></div>");
          var message = $("<div class='message'></div>");
          var messageBox = $("<div class='messageBox2'></div>");
        }
        $('#main').append(message);
        $(message).append(user);
        $(message).append(messageBox);
        $(user).append(userImage);
        $(messageBox).append(userName);
        $(userName).html(messageUserName);
        $(messageBox).append(content);
        $('#loading').remove();
        $('#main').scrollTop(1E6);

      });
    });
    $('#loading').remove();
  }, 1500);

  setTimeout(function() {
    $('#main').scrollTop(1E6);
  }, 1650);

  //Prints out message sent through message input to the screen
  function sendMessage() {
    var input = $('#chatInput').val();
    if (input == "") {
      return false;
    }

    var messageDate = new Date();
    var messageTime = messageDate.getTime();
    
    console.log(messageTime);

    messages.push({
      message: input,
      messageUser: currentUserID,
      messageUserName: currentUserName
    });

    $('#chatInput').val('');
  }

  //Signs user out and returns them to login Page
  $('#logout').on('click', function() {
    firebase.auth().signOut();
    window.location.replace("index.html");
  });

  //Sends message when send button is clicked
  $('#send').on('click', function() {
    sendMessage();
  });

  //Sends message when enter is pressed while message input field is focused on
  $('#chatInput').on('keypress', function(e) {
    if (e.keyCode == 13) {
      event.preventDefault();
      sendMessage();
    }
  });
});
