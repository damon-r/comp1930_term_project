$(document).ready(function() {
    // = = = = = Define Variables = = = = =
    const dbRef = firebase.database();
    var userList = [];

    //listens for user authentication status. Directs user to index.html if
    //log out.
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('onAuthStateChanged: ' + user.uid);
            var currentUserRef = dbRef.ref('users/' + user.uid);
            setUsername(currentUserRef);
        } else {
            //not logged in, direct to log in page.
            window.location.href = "./index.html";
            console.log('user not logged in');
        }
    });

    //sets the user name on the top right cornner.
    function setUsername(currentUserRef) {
        currentUserRef.once('value').then(function(snapshot) {
            var userName = snapshot.child('displayName').val();
            $('#profileName').text(userName);
            userList.push(snapshot.child('email').val());
        });
    }

    //Add yourself to the array.
    setTimeout(function() {
        //user = firebase.auth().currentUser.displayName;
        userCount = 1; //How many users are in the room. Defaults to 1, because you're kinda making it.
        //currentUserDisplay = firebase.auth().currentUser.displayName; //This is your username. Hi!
        ; //An array to hold usernames.
    }, 500);

    // = = = = = Button Events = = = = =
    //Spawn new list items on click, assuming a name is typed.
    $("#addPerson").click(function(event){
        var nameOfAdded = $("#personToAdd").val();

        if (nameOfAdded != "") {
            userCount += 1;
            userList.push(nameOfAdded);
            $("#userList").append("<div class='person'><p class='personName'>" + nameOfAdded + "</p><div class='deleteButton'><span>&times</span></div></div>");
            $("#personToAdd").val("");
       } else {
            alert("Please provide a user to add.");
        }
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
        var position = $.inArray(nameWithin, userList, 0);

        //Edit array.
        userList[position] = "";
        userList = userList.filter(trimArray);
        $(this).closest(".person").remove();
    });

     //Create room on click.
    $("#createRoom").click(function(event){

        //Check if the name is filled.
        if ($("#roomName").val() != "") {
            let inputName = $("#roomName").val();
            let inputDesc = $("#roomDesc").val();
            let inputColor = $("#roomColor").val();
            writeUserData(inputName, inputDesc, inputColor);
            setTimeout(function() {
                window.location.href = "main.html";
            }, 1000);
        } else {
            alert("Your room requires a name!");
        }
    });

    //logs out current user when click.
    $('#logout').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        firebase.auth().signOut();
        window.location.href = "./index.html";
    });

    // = = = = = Add to Database, Join Room = = = = =
    //Adds the room to the database, and adds the person to the room.
    function writeUserData(inputName, inputDesc, inputColor) {
        var newGroupUid = dbRef.ref().child('groups').push().key;
        
        //Write the new group's data simultaneously in the groups list and the 
        //user's group list.
        var addingGroupToUser = {};
        var uid = firebase.auth().currentUser.uid;
        console.log("Current ID: ", uid);
        console.log("Room ID: ", newGroupUid);
        addingGroupToUser['users/' + uid + '/groups/' + newGroupUid] = true;
        dbRef.ref().update(addingGroupToUser);

        //Write invited users in as well
        var ref = firebase.database().ref('users');
        var updates = {};
        var members = {};
        for (let user of userList) {
            ref.orderByChild('email').equalTo(user).on("child_added", function(snapshot) {
                var uidOther = snapshot.key;
                
                updates['users/' + uidOther + '/groups/' + newGroupUid] = true;
                members['groups/' + newGroupUid + '/memberInfo/' + uidOther] = user;
                console.log('members obj: ' + members);
                console.log('members obj: ' + updates);
                dbRef.ref().update(updates);
                dbRef.ref().update(members);
            });
        }
        
        firebase.database().ref('groups/' + newGroupUid).set({
            dateCreated: getCurrentDate(),
            title: inputName,
            description: inputDesc,
            roomColor: inputColor,
            memberCount: userList.length,
            memberInfo: members,
        });
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

    // = = = = = Trim Array = = = = =
    //A thing used to determine what to put in the new array.
    function trimArray(name) {
        return name != "";
    }

    });