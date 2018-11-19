$(document).ready(function() {

  var database = firebase.database();
  var rootRef = database.ref();

  var group_title, group_description, group_createdOn, group_memberCount;
  
  //database.ref('/groups' + groupUid);
  function writeUserData(inputName, inputDesc, inputImage) {
    firebase.database().ref('groups/' + inputName).set({
      roomDesc: inputDesc,
      roomImage: inputImage,
      count: userCount,
      users: userList
  });
  }

  //============creating and writing a new group==================
  function createNewGroup(username, picture, title, body) {
    // A new group
    var newGroupData = {
      title: newGroupTitle,
      description: "", 
      memberCounts: 0,
      dateCreated: "",
      memberInfo: {
        uid: {
          email: "",
        }
      }
    };
  
    // Get a key for a new group.
    var newGroupUid = rootRef.child('groups').push().key;
  
    // Write the new group's data simultaneously in the groups list and the user's group list.
    var updates = {};
    updates['/groups/' + newGroupUid] = newGroupData;
    updates['/users/' + uid + '/' + groups] = newGroupUid;
  
    return rootRef.update(updates);
  }
  //==========end of creating and writing a new group function=============
  
  
  
  //retrieve sign on user's groupUids.
  //var userUid = firebase.auth().currentUser.uid;
  var userUid = '9EqPuCH1fEU4siXeBZyJHSxyS8I3';
  database.ref('users/' + userUid + '/groups').once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var groupUid = childSnapshot.key;
      console.log(groupUid);
      retrieveGroupInfo(groupUid);
      addAGroupTable(group_title, group_description, group_memberCount, group_createdOn);
    });
  });

  //retrieving information according to groupUid.
  function retrieveGroupInfo(groupUid) {
    database.ref('groups/' + groupUid).once('value').then(function(snapshot) {
      group_title = snapshot.child('title').val();
      group_description = snapshot.child('description').val();
      group_memberCount = snapshot.child('member').val();
      group_createdOn = snapshot.child('date').val();
      console.log(group_title);
      console.log(group_description);
      console.log(group_memberCount);
      console.log(group_createdOn);
    });
  }

  //=======function of creating and appending a group table.========
  function addAGroupTable(group_title, group_description, group_memberCount, group_createdOn) {
    console.log(group_title);
    console.log(group_description);
    console.log(group_memberCount);
    console.log(group_createdOn);
    //table header for group title.
    var table = $('<table></table');
    var tr_groupTitle = $('<tr></tr>');
    var td_groupTitle = $('<td></td>');
    td_groupTitle.attr('colspan', '2');
    td_groupTitle.text(group_title);

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
    p_groupMemberCount.text(group_memberCount);
    var p_groupDateCreated = $('<p></p>');
    p_groupDateCreated.addClass('descriptionToRoom');
    p_groupDateCreated.text(group_createdOn);

    //table footer for ENTER and EXIT a group.
    var tr_footer = $('<tr></tr>');
    var td_enter = $('<td></td>');
    td_enter.text('Enter');
    var td_exit = $('<td></td>');
    td_exit.text('Exit');

   //appending all the elements above.
    tr_groupTitle.append(td_groupTitle);

    td_groupInfo.append(img_groupIcon, p_groupDesc, p_groupMemberCount,    p_groupDateCreated);
    tr_groupInfo.append(td_groupInfo);

    tr_footer.append(td_enter, td_exit);

    table.append(tr_groupTitle, tr_groupInfo, tr_footer);
    $('#roomSpace').append(table);
  }
  //=======end of the function.========


  //generate a new group uid for storing new group info.
  //var newGroupUid = rootRef.child('groups').push().key;
})

