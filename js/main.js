$(document).ready(function() {
  const database = firebase.database();
  const rootRef = database.ref();

  //listens for user authentication status.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var userUid = user.uid;
      var currentUserRef = database.ref('users/' + userUid);
      console.log('onAuthStateChanged: ' + userUid);
      setUsername(currentUserRef);
      loopForUserGroups(currentUserRef);
      //loopForUserAgendas(currentUserRef);
    } else {
      console.log('user not logged in');
    }
  });

  //sets the user name on the top right cornner.
  function setUsername(currentUserRef) {
    currentUserRef.once('value').then(function(snapshot) {
        var userName = snapshot.child('displayName').val();
        $('#profileName').text(userName);
    });
  }

  //retrieves current user's groups, needs to be run once page is loaded.
  //!!!!!!!!!!!might need to sort the data first!!!!!!!!!!!!!!
  function loopForUserGroups(currentUserRef) {
    currentUserRef.child('groups').once('value').then(function(snapshot) {
      var contains = snapshot.exists();
      if (!contains) {
        $('#roomSpace').text('No Groups Yet.');
        console.log('No group data.');
      } else {
        console.log('Start looping for groups.');
        $('#roomSpace').text('');
        snapshot.forEach(function(childSnapshot) {
          var uid = childSnapshot.key;
          console.log('groupUid: ' + uid + '\n');
          retrieveGroupInfo(uid);
        });
      }
    });
  }

  //retrieves all info under the passed in groupUid node in the database. if the
  //info does not contain any null value, it then passes the info to
  //addAGroupTable function to create and append a table onto the webpage.
  function retrieveGroupInfo(groupUid) {
    database.ref('groups/' + groupUid).once('value').then(function(snapshot) {
      var group_title = snapshot.child('title').val();
      var group_description = snapshot.child('description').val();
      var group_memberCount = snapshot.child('memberCount').val();
      var group_createdOn = snapshot.child('dateCreated').val();
      var group_color = snapshot.child('roomColor').val();
      console.log('group_color' + group_color);
      if (group_color == null) {
        //default color for group table border.
        group_color = 'black';
      }
      console.log('retrieveGroupInof function called.');
      console.log('retrieved value:\n' + group_title + group_description +
        group_memberCount + group_createdOn);
      //if group info contains
      if (group_title == null || group_description == null ||
        group_memberCount == null || group_createdOn == null) {
        console.log('group info contains null');
      } else {
        console.log('calling addAGroupTable function...');
        addAGroupTable(groupUid, group_title, group_description,
          group_memberCount, group_createdOn, group_color);
      }
    });
  }
  //===========end of the function.==============


  //adds a dynamic group table according to the parameters passed in.
  //the css of the table is also applied in here.
  function addAGroupTable(groupUid, group_title, group_description,
    group_memberCount, group_createdOn, group_color) {
    var table = $('<table></table>');
    table.css('border', '3px solid ' + group_color);
    table.css('width', '14em');
    table.attr('id', groupUid);
    var tr_groupTitle = $('<tr></tr>');
    var td_groupTitle = $('<td></td>');
    td_groupTitle.attr('colspan', '2');
    td_groupTitle.css('border', '3px solid ' + group_color);

    var p_groupTitle = $('<p></p>');
    p_groupTitle.css('height', '2em');
    p_groupTitle.css('max-width', '14em');
    p_groupTitle.css('margin', '0');
    p_groupTitle.css('overflow', 'auto');
    p_groupTitle.css('white-space', 'nowrap');
    p_groupTitle.html('<b>' + group_title + '</b>');
    td_groupTitle.append(p_groupTitle);
    //table body for group information.
    var tr_groupInfo = $('<tr></tr>');
    var td_groupInfo = $('<td></td>');
    td_groupInfo.css('border', '3px solid ' + group_color);
    td_groupInfo.attr('colspan', '2');
    var p_groupDesc = $('<p></p>');
    p_groupDesc.addClass('descriptionToRoom');
    p_groupDesc.css('height', '5em');
    p_groupDesc.css('word-wrap', 'break-word');
    p_groupDesc.css('overflow', 'auto');
    p_groupDesc.text(group_description);
    var p_groupMemberCount = $('<p></p>');
    p_groupMemberCount.addClass('descriptionToRoom');
    p_groupMemberCount.css('margin-bottom', '0');
    p_groupMemberCount.text('Members: ' + group_memberCount);
    var p_groupDateCreated = $('<p></p>');
    p_groupDateCreated.addClass('descriptionToRoom');
    p_groupDateCreated.css('margin-top', '0');
    p_groupDateCreated.text('Created on: ' + group_createdOn);
    var p_key = $('<p></p>');
    p_key.addClass('descriptionToRoom');
    p_key.html('<b>Invitation Key:</b><br/>' + groupUid);
    //table footer for ENTER and EXIT a group.
    var tr_footer = $('<tr></tr>');
    tr_footer.css('text-align', 'center');
    var td_enter = $('<td></td>');
    td_enter.css('border', '3px solid ' + group_color);
    var enter_button = $('<button></button>');
    enter_button.text('Enter');
    enter_button.addClass(groupUid);
    enter_button.addClass('enterButtons');
    var td_exit = $('<td></td>');
    td_exit.css('border', '3px solid ' + group_color);
    var exit_button = $('<button></button>');
    exit_button.text('Quit');
    exit_button.addClass(groupUid);
    exit_button.addClass('exitButtons');
    //appending all the elements above.
    tr_groupTitle.append(td_groupTitle);
    td_groupInfo.append(p_groupDesc, p_groupMemberCount, p_groupDateCreated, p_key);
    tr_groupInfo.append(td_groupInfo);
    td_enter.append(enter_button);
    td_exit.append(exit_button);
    tr_footer.append(td_enter, td_exit);
    table.append(tr_groupTitle, tr_groupInfo, tr_footer);
    $('#roomSpace').prepend(table);
    console.log('addAGroupTable function called.');
  }
  //===========end of the function.==============

  //removes given groupUid under "users" and "groups" nodes in the database.
  function removeGroupInfoFromDatabase(groupUid) {
    var uid = firebase.auth().currentUser.uid;
    //removes groupUid from current user's groups.
    database.ref('users/' + uid).child('groups/' + groupUid).remove();
    //removes memberUid from memberInfo in the group.
    database.ref('groups/' + groupUid + '/memberInfo/' + uid).remove();
    //decrementes the memberCount of the group by 1.
    rootRef.child('groups/' + groupUid).once('value').then(function(snapshot) {
      var decrementCount = {};
      var originalCount = snapshot.child('memberCount').val();
      decrementCount['groups/' + groupUid + '/memberCount'] =
        parseInt(originalCount) - 1;
      rootRef.update(decrementCount);
    });
    console.log('removeGroupInfoFromDatabase function called.');
  }
  //=========end of the function=======================

  //=====================event handling section================================
  //clicks enter buttons will remove the corresponding room by parsing the value
  //of the class, which contains the groupUid.
  $(document).on('click', '.exitButtons',
  function quitAGroupConfirmation() {
    var classes = $(this).attr('class').split(' ');
    var groupUid = classes[0];
    if (confirm("Are you sure you want to quit this group?")) {
      $('#' + groupUid).remove();
      console.log('calling removeGroupInfoFromDatabase...');
      removeGroupInfoFromDatabase(groupUid);
    }
  });

  //clicks enter buttons will enter the corresponding room by parsing the value
  //of the class, which contains the groupUid.
  $(document).on('click', '.enterButtons',
  function redirect() {
    var [groupUid] = $(this).attr('class').split(' ');
    window.location.href = "./chat_room.html#" + groupUid;
  });

  //triggers a popup that asks for a groupUid to join.
  $('#joinARoom').click(function promptToGetKey(){
      $('#getKeyModal').css('display', 'block');
    });

  //closes the "join a room" popup.
  $('#closeBtn').click(function closeModal() {
    $('#getKeyModal').css('display', 'none');
    $('.errorText').text("");
  });

  //pressing Enter key has the same effect as clicking "create" button.
  $("#groupKey").on("keypress", function(e) {
    if (e.which === 13) {
    $('#validateBtn').click();
    }
  });

  //validates if the entered groupUid exists in the database, if yes, join the
  //user into the group. if no, show the error text.
  $('#validateBtn').click(function validateKey() {
    rootRef.once('value').then(function(snapshot) {
      var groupKeyEntered = $('#groupKey').val();
      console.log('key enter' + groupKeyEntered);
      var contains = snapshot.child('groups/' + groupKeyEntered).exists();
      if (contains) {
        var uid = firebase.auth().currentUser.uid;
        //checks if currentUser is in the group alreay.
        var isInTheGroup = snapshot.child('users/' + uid + '/groups/' + groupKeyEntered).exists();
        var email = snapshot.child('users/' + uid + '/email').val();
        console.log(isInTheGroup + ' ' + email);
        //if not in the group, do the updates.
        if (!isInTheGroup) {
          console.log('You are not in the group: ' + groupKeyEntered);
          $('.errorText').text("");
          console.log('group found');
          var updates = {};
          var newMemberCount = snapshot.child('groups/' + groupKeyEntered + '/memberCount').val() + 1;
          console.log(uid + newMemberCount);
          updates['users/' + uid + '/groups/' + groupKeyEntered] = true;
          updates['groups/' + groupKeyEntered + '/memberCount'] = newMemberCount;
          updates['groups/' + groupKeyEntered + '/memberInfo/' + uid] = email;
          rootRef.update(updates);
          console.log('group: ' + groupKeyEntered + ' added.');
        }
        console.log('Directing you to room: ' + groupKeyEntered);
        setTimeout(function() {
          window.location.href="./chat_room.html#" + groupKeyEntered;
        }, 1000);
      } else {
        $('.errorText').text("The key is not valid.");
      }
    });
  });

  //logs out current user when click.
  $('#logout').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    firebase.auth().signOut();
    window.location.href = "./index.html";
  });
  //=====================end of event handling sction==========================

});
