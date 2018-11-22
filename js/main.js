$(document).ready(function() {

  var database = firebase.database();
  var rootRef = database.ref();
  //var userUid = firebase.auth().currentUser.uid;
  var userUid = '9EqPuCH1fEU4siXeBZyJHSxyS8I3';
  var currentUserRef = database.ref('/users/' + userUid);
  
  
  var group_title, group_description, group_createdOn, group_memberCount, currentUserEmail, currentUserDisplayName;

  $('#roomSpace').text('');
  $('#agendaSpace').text('');

  //sets the user name on the top right cornner.
  currentUserRef.once('value').then(function(snapshot) {
      var userName = snapshot.child('displayName').val();
      $('#profileName').text(userName);
  });
  
  //retrieves current user's groups, needs to be run once page is loaded.
  //!!!!!!!!!!!might need to sort the data first!!!!!!!!!!!!!!
  currentUserRef.child('groups').once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var uid = childSnapshot.key;
      retrieveGroupInfo(uid);
    });
  });

  //retrieves current user's agendas, needs to be run once page is loaded.
  currentUserRef.child('/agendas').once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var uid = childSnapshot.key;
      retrieveAgendaInfo(uid);
    });
  });

  //retrieves title, description, memberCount and creadtedOn info 
  //of a group using //groupUid, adds them onto a table and 
  //displays them on page.
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


  //=======creating and appending a group table.========
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

  //var ref = database.ref('agendas').orderByChild('dueDate');
  function retrieveAgendaInfo(agendaUid) {

    database.ref('agendas').once('value').then(function(snapshot) {
      console.log(agendaUid);
      var dataObj = {
        //assignedTo: snapshot.child('assignedTo').val(),
        description: snapshot.child('description').val(),
        dueDate: snapshot.child('dueDate').val(),
        dueTime: snapshot.child('dueTime').val(),
      };
      console.log('agenda info Retieved..');
      addAAgendaList(agendaUid, dataObj);
    });
  }

  //==============creating and appending a agenda list======
  function addAAgendaList(agendaUid, {description, dueDate, dueTime}) {
    console.log(agendaUid + description + dueDate + dueTime);
    var div_agendas = $('<div></div>');
    div_agendas.addClass('agendas');
    var h2_groupTitle = $('<h2></h2>');
    h2_groupTitle.text("");
    div_agendas.append(h2_groupTitle);
    //need to loop this
    var div_individualAgenda = $('<div></div>');
    div_individualAgenda.addClass('individualAgenda')
    var h4_agendaDesc = $('<h4><//h4>');
    h4_agendaDesc.addClass('agendaDesc');
    //h4_agendaDesc.text(description);
    h4_agendaDesc.text(agendaUid);
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
    $('#agendaSpace').append(div_agendas);
  }
  //==============end of the function============

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

  //click enter buttons will enter the corresponding room.
  $(document).on('click', '.enterButtons', 
  function redirect() {
    var [groupUid] = $(this).attr('class').split(' ');
    window.location.href = "./chat-room/index.html?" + groupUid;
  });

  $('#joinARoom').click(function promptToGetKey(){
      $('#getKeyModal').css('display', 'block');
    });
    
  $('#closeBtn').click(function closeModal() {
    $('#getKeyModal').css('display', 'none');
    $('.errorText').text("");
  });

  // $('#validateBtn').click(function validateKey() {
  //   database.ref('groups/').once('value').then(function(snapshot) {
  //     snapshot.forEach(function(childSnapshot) {
  //       var groupUid = childSnapshot.key;
  //       console.log('keyRetieved:' + groupUid);
  //       var groupKeyEntered = $('#groupKey').val();
  //       console.log(groupKeyEntered);
  //       if (groupUid == groupKeyEntered) {
  //         $('.errorText').text("");
  //         console.log('found');
  //         //window.location.href="./chat-room/index.html";
  //         return;
  //       }
  //     });
  //     $('.errorText').text("The key is not valid.");
  //   });
    
  // });

  $('#validateBtn').click(function validateKey() {
    database.ref('groups/').once('value').then(function(snapshot) {
      var groupKeyEntered = $('#groupKey').val();
      console.log('key enter' + groupKeyEntered);
      var contains = snapshot.child(groupKeyEntered).exists();
      console.log(contains);
      if (contains) {
          $('.errorText').text("");
          console.log('found');
          window.location.href="./chat-room/index.html?" + groupKeyEntered;
      } else {
        $('.errorText').text("The key is not valid.");
      }
    });
  });

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
  //=========end of the function=======================


  //removes given groupUid from "users" and "groups", including all the data 
  //under the groupUid.
  function removeGroupInfoFromDatabase(groupUid) {
    console.log('beginning to remove groups under userUid');
    currentUserRef.child('groups/' + groupUid).remove();
    //database.ref('groups/').child(groupUid).remove();
  }
  //=========end of the function=======================



  










  //parses the url address and get the currentGroupUid.
  var currentGroupUid = getCurrentGroupUidFromUrl();
  

  //parses the url with delimiter ('?') and gets the groupUid.
  function getCurrentGroupUidFromUrl() {
      var url = document.location.href;
      //var currentGroupUid = url.split('?')[1];
      var currentGroupUid ='-LRoR2dwlyAUq70qYL0F';
      return currentGroupUid;
  }

  console.log('geting group uid from url: ' + currentGroupUid);
  



  //creates a json object containing all the agenda info passed in and generates
  //a random key assigned to that agenda, lastly, store these info under the
  //currentGroupUid.
  function updatingANewAgenda(currentGroupUid, newAgenda_description, newAgenda_dateDue, newAgenda_timeDue, newAgenda_memberObj) {
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
          assignedTo: newAgenda_memberObj,
        };
        // Get a key for a new group.
        var newAgendaUid = rootRef.child('agendas').push().key;
        console.log('new key for agenda:' + newAgendaUid);
        // Write the new group's data simultaneously in the groups list and the 
        //user's group list.
        var updates = {};
        updates['agendas/' + newAgendaUid] = newAgendaData;
        updates['groups/' + currentGroupUid + '/agendas/'  + newAgendaUid] = true;
        updates['users/' + userUid + '/agendas/'  + newAgendaUid] = true;
        console.log('updatingAgenda called.');
        return rootRef.update(updates);
      }
    });
  }
  //==========end of the function=============

  //clicks the create button on the create agenda modal will write all the value
  //in the input boxes to the database.
  $('#createAgendaBtn').click(function getAgendaInfo() {
    var agendaDescription = $('#agendaDesc').val();
    var agendaDueDate = $('#dueDate').val();
    var agendaDueTime = $('#dueTime').val();
    var assignedTo = {};
    //store values of the checked box in 'assigned' object.
    $('.nameCheckbox:checked').each(function iterator(){
      assignedTo[$(this).val()] = true;
    });
    updatingANewAgenda(currentGroupUid, agendaDescription, agendaDueTime, agendaDueDate, assigned);
  });
})

