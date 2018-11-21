$(document).ready(function() {

  var database = firebase.database();
  var rootRef = database.ref();
  //var userUid = firebase.auth().currentUser.uid;
  var userUid = '9EqPuCH1fEU4siXeBZyJHSxyS8I3';
  var currentUserRef = database.ref('/users/' + userUid);
  
  
  var group_title, group_description, group_createdOn, group_memberCount, currentUserEmail, currentUserDisplayName;

  //sets the user name on the top right cornner.
  currentUserRef.once('value').then(function(snapshot) {
      var userName = snapshot.child('displayName').val();
      $('#profileName').text(userName);
  });
  
  //retrieves current user's groups, needs to be run once page is loaded.
  //!!!!!!!!!!!might need to sort the data first!!!!!!!!!!!!!!
  database.ref('users/' + userUid + '/groups').once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var groupUid = childSnapshot.key;
      retrieveGroupInfo(groupUid);
    });
  });

  //click exit buttons will get a warning of quiting a group, if 
  //"OK" is clicked, remove that group info from the page and the
  //database.
  $(document).on('click', '.exitButtons', 
  function quitAGroupConfirmation() {
    var classes = $(this).attr('class').split(' ');
    var groupUid = classes[0];
    if (confirm("Are you sure you want to quit this group?")) {
      $('#' + groupUid).remove();
      removeGroupInfoFromDatabase(groupUid);
    }
  });

  //click enter buttons will 
  $(document).on('click', '.enterButtons', 
  function redirect() {
    window.location.href = "./chat-room/index.html";
  });

  
  $('#joinARoom').click(function promptToGetKey(){
      $('#getKeyModal').css('display', 'block');
    });
    
  $('#closeBtn').click(function closeModal() {
    $('#getKeyModal').css('display', 'none');
    $('.errorText').text("");
  });

  $('#validateBtn').click(function validateKey() {
    database.ref('groups/').once('value').then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var groupUid = childSnapshot.key;
        console.log(groupUid);
        var groupKeyEntered = $('#groupKey').val();
        console.log(groupKeyEntered);
        if (groupUid == groupKeyEntered) {
          $('.errorText').text("");
          window.location.href="./chat-room/index.html";
          return;
        }
      });
      $('.errorText').text("The key is not valid.");
    });
    
  });
  // //database.ref('/groups' + groupUid);
  // function writeUserData(inputName, inputDesc, inputImage) {
  //   firebase.database().ref('groups/' + inputName).set({
  //     roomDesc: inputDesc,
  //     roomImage: inputImage,
  //     count: userCount,
  //     users: userList
  //   });
  // }
  
  //createNewGroup();
  //retieve current user's displayName and email.
  function createNewGroup() {
    currentUserRef.once('value').then(function(snapshot) {
      currentUserDisplayName = snapshot.child('displayName').val();
      currentUserEmail = snapshot.child('email').val();
      var newGroup_title = "new tile"; //get the text from web.
      var newGroup_description = "new description"; //get the description from web.
      console.log(currentUserDisplayName,currentUserEmail,newGroup_title,newGroup_description);
      updatingNewGroup(newGroup_title, newGroup_description, currentUserEmail, currentUserDisplayName);
    });
  }

  //creates a json object containing all the group info passed in and generates
  //a random key assigned to that group.
  function updatingNewGroup(newGroup_title, newGroup_description, currentUserEmail, currentUserDisplayName) {
    var currentDate = getCurrentDate();
    // A new group
    var newGroupData = {
      title: newGroup_title,
      description: newGroup_description,
      memberCounts: 1,
      dateCreated: currentDate,
      memberInfo: {
        [userUid]: {
          email: currentUserEmail,
          displayName: currentUserDisplayName,
        },
      },
    };
    // Get a key for a new group.
    var newGroupUid = rootRef.child('groups').push().key;
    // Write the new group's data simultaneously in the groups list and the 
    //user's group list.
    var updates = {};
    updates['groups/' + newGroupUid] = newGroupData;
    updates['users/' + userUid + '/groups/' + newGroupUid] = true;
    console.log('updatingNewGroup() called.');
    return rootRef.update(updates);
  }
  //==========end of the function=============

  //==========get current date function, eg. Nov 20, 2018.=================
  function getCurrentDate() {
    var monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "October",
      "Nov", "Dec"
    ];
    var currentDate = new Date();
    var date = currentDate.getDate();
    var month = currentDate.getMonth();
    var year = currentDate.getFullYear();
    return monthNames[month] + " " + date + ", " + year;
  }
  //=========end of the function=======================


  //removes given groupUid from "users" and "groups", including all the data 
  //under the groupUid.
  function removeGroupInfoFromDatabase(groupUid) {
    console.log('beginning to remove groups under userUid');
    currentUserRef.child('groups/' + groupUid).remove();
    database.ref('groups/').child(groupUid).remove();
  }
  //=========end of the function=======================


  //retrieves title, description, memberCount and creadtedOn info of a group using //groupUid, adds them onto a table and displays them on page.
  function retrieveGroupInfo(groupUid) {
    database.ref('groups/' + groupUid).once('value').then(function(snapshot) {
      console.log(groupUid);
      group_title = snapshot.child('title').val();
      group_description = snapshot.child('description').val();
      group_memberCount = snapshot.child('memberCounts').val();
      group_createdOn = snapshot.child('dateCreated').val();
      console.log('group Info Retieved..');
      addAGroupTable(groupUid, group_title, group_description, group_memberCount, group_createdOn);
    });
  }
  //===========end of the function.==============
  
  //=======function for creating and appending a group table.========
  $('#roomSpace').text("");
  function addAGroupTable(groupUid, group_title, group_description, 
    group_memberCount, group_createdOn) {
      
    var table = $('<table></table>');
    table.attr('id', groupUid);
    var tr_groupTitle = $('<tr></tr>');
    var td_groupTitle = $('<td></td>');
    td_groupTitle.attr('colspan', '2');
    td_groupTitle.text(groupUid); //change to group_title later.
    //table body for group information.
    var tr_groupInfo = $('<tr></tr>');
    var td_groupInfo = $('<td></td>');
    td_groupInfo.attr('colspan', '2');
    var img_groupIcon = $('<img/>');
    img_groupIcon.attr('src', 'url'); // add room icon url here.
    img_groupIcon.attr('alt', 'Room Icon');
    var p_groupDesc = $('<p></p>');
    p_groupDesc.addClass('descriptionToRoom');
    p_groupDesc.text(group_description);
    var p_groupMemberCount = $('<p></p>');
    p_groupMemberCount.addClass('descriptionToRoom');
    p_groupMemberCount.text('Members: ' + group_memberCount);
    var p_groupDateCreated = $('<p></p>');
    p_groupDateCreated.addClass('descriptionToRoom');
    p_groupDateCreated.text('Created on: ' + group_createdOn);
    //table footer for ENTER and EXIT a group.
    var tr_footer = $('<tr></tr>');
    var td_enter = $('<td></td>');
    var enter_button = $('<button></button>');
    enter_button.text('Enter');
    enter_button.addClass(groupUid);
    enter_button.addClass('enterButtons');
    var td_exit = $('<td></td>');
    var exit_button = $('<button></button>');
    exit_button.text('Exit');
    exit_button.addClass(groupUid);
    exit_button.addClass('exitButtons');
    //appending all the elements above.
    tr_groupTitle.append(td_groupTitle);
    td_groupInfo.append(img_groupIcon, p_groupDesc, p_groupMemberCount,    p_groupDateCreated);
    tr_groupInfo.append(td_groupInfo);
    td_enter.append(enter_button);
    td_exit.append(exit_button);
    tr_footer.append(td_enter, td_exit);
    table.append(tr_groupTitle, tr_groupInfo, tr_footer);
    $('#roomSpace').prepend(table);
    
  }
  //===========end of the function.==============
})

