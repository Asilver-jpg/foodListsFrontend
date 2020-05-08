let username= "1"
let userID= ""

window.onload = function () {
    if(document.getElementById("signup")){
    document.getElementById("signup").addEventListener("click", function(e){
        e.preventDefault()
        makeUser(e)
    })
}
    if (username===""){
        setLogin()
        
       
    }else{
   
  changePageToApp()
   


}
}

//opens the list when button is clicked
function openList(evt, id) {
    let div = returnList(id)
    let list = div.innerText.split(",")
    let content = document.getElementsByClassName("listInput")
    for (let i = 0; i < content.length; i++) {
        content[i].removeAttribute("data-item")
        content[i].removeAttribute("data-itemList")
        content[i].value=""
    }
    for (let i = 0; i < list.length; i++) {
        content[i].value = list[i]
        let items = div.dataset.items.split(",")
        let itemLists = div.dataset.itemLists.split(",")
        content[i].dataset.item = items[i]
        content[i].dataset.itemList = itemLists[i]
    }
    tablinks = document.getElementsByClassName("tabLinks")
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    evt.target.className += " active";
}

//loads app page and adds all event listeners
function changePageToApp(){
    setApp();
    loadLists();
    const buttons = document.getElementsByClassName("tabLinks")
    const firstButton = buttons[0]
    let buttonDiv = document.getElementById("lists")
    buttonDiv.addEventListener("click", function (e) {
        if (e.target.className === "tabLinks") {
            openList(e, e.target.dataset.id)
        }
    })
    let listContent = document.getElementById("listContent")
    listContent.addEventListener("focusout", function (e) {

        if (e.target.className === "listInput") {
            updateOrPostItemList(e.target, e.target.dataset.itemList)
            deleteItemLists()
        }
    })
    let firstTab= document.getElementsByClassName("tabLinks")
    console.dir(firstTab)
    let logout= document.getElementById("logout")
    logout.addEventListener("click", function(e){
        logout()
    })
    // let addButton= document.getElementById("addlist")
    // addButton.addEventListener("click", function(e){
    //     displayAddForm()
    // })
    // let userButton= document.getElementById("adduser")
    // userButton.addEventListener("click", function(e){
    //     displayAddUserForm()
    // })
}
//logs out
function logout(){
    console.log("logging out...")
username=""
userID=""
location.reload()
}

//displays the add list form
function displayAddForm(){
  
   let form= document.getElementsByClassName("addForm")
    form.style.display="block";
}
function displayAddUserForm(){
   
   let form= document.getElementsByClassName("addUserForm")
    form.style.display="block";
}

//toggles css of inputs when clicked & adds/removes from delete queue
function toggle(e){
    if(e.target.style.textDecoration === ""){
        e.target.style.textDecoration ="line-through"
        e.target.style.color ="gray"
        e.target.dataset.delete =true
        addToDelete(e.target)
    }else{
        e.target.style.textDecoration =""
        e.target.style.color ="black"
        e.target.removeAttribute("data-delete")
        removeFromDelete(e.target)
    }
}

//adds item to delete queue
function addToDelete(target){
let del= document.getElementById("toDelete")
console.log(del)
del.innerText= del.innerText + ` ${target.dataset.itemList}, `
}

//removes item from delete queue
function removeFromDelete(target){
    let del= document.getElementById("toDelete")
    let id= target.dataset.itemList
    console.log(`ID: ${id}`)
    let match= del.innerText.indexOf(`${id},`)
    console.dir(match)
    let str= del.innerText.slice(0, match) + del.innerText.slice(match+(id.length+1),del.innerText.length)
    del.innerText=str
}

//delete an item_list relation
function deleteItemLists(){
    let del= document.getElementById("toDelete")
    let delArr= del.innerText.split(",")
    for(itemList of delArr){
       let d= document.querySelectorAll(`[data-item-list~="${itemList}"]`)
   
        d.value= ""
        console.log(d)
        fetch(`http://localhost:3000/item_lists/${itemList}`, {
            method: 'DELETE'

        })
    }
}

//uploads or posts item list depending on if itemList or item exists or not
function updateOrPostItemList(target, itemList) {
    let listID = document.getElementsByClassName("active")[0].dataset.id
    let itemName = getItem(target.value)
    let quantity = getQuantity(target.value)
    if (itemList) {
        //update itemList in db
        fetch(`http://localhost:3000/item_lists/${itemList}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ itemListID: itemList, item_name: itemName, list_id: listID, quantity: quantity, note: "" })
        })
        .then(resp => {
            loadListContents()
            });
    } else {
        //post itemList in db
        fetch('http://localhost:3000/item_lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "accept": 'application/json' },
            body: JSON.stringify({ item_name: itemName, list_id: listID, quantity: quantity, note: "" })
        })
        .then(resp => {
            loadListContents()
        })
        .catch((error) => console.error('Error', error));
        
    }
   
}

function returnList(id) {
    let singleLists = document.getElementsByClassName("singleList");
    for (const list of singleLists) {
        if (list.dataset.id === id) {
            return list
        }
    }
}

//creates buttons and lists
function loadLists() {
    let json = getLists().then(data => {
    listsDiv = document.getElementById("lists")
    listsDiv.innerHTML=""
        for (list of data) {
            appendList(list)
            createButtons(list)
        }
        addFormButton= document.createElement("button")
        addFormButton.innerHTML=` <i class="fas fa-list svg" id="addList">+</i>`
        addFormButton.className ="tabLinksRight"
        addFormButton.id = "addlist"

        addUserButton= document.createElement("button")
        addUserButton.innerHTML=`<i class="fas fa-user-plus" id="addUser"></i>`
        addUserButton.className ="tabLinksRight"
        addUserButton.id = "adduser"
        listsDiv.appendChild(addFormButton)

        listsDiv.appendChild(addUserButton)
    })


}

//for reloading just list contents and not buttons
function loadListContents(){
   let node= document.getElementById("content")
  
   node.innerHTML=""
    console.log(node)
    let json = getLists().then(data=>{
        for(list of data){  
        appendList(list)
        }
    })
}

//needs to access user's lists
function getLists() {
    return fetch("http://localhost:3000/lists").then(resp => resp.json())
}


//run in a loop and creates divs for lists on page
function appendList(list) {
    
    let itemDetails = makeList(list)
    let addString = itemDetails[0].join(",")
    let newList = document.createElement("div")
    newList.dataset.items = itemDetails[1].join(",")
    let itemLists = itemDetails[2].map(function (value) { return value.id })
    newList.dataset.itemLists = itemLists.join(",")
    newList.className = "singleList"
    newList.dataset.id = list.id
    newList.innerText = addString;
    document.getElementById("content").appendChild(newList)
}

//makes an Arr of Arr to be parsed in Append List
function makeList(list) {
    let nameArr = []
    let itemArr = []
    let itemsListsArr = []
    let itemsList = list.item_lists
    let items = list.items
    for (let i = 0; i < items.length; i++) {
        nameArr.push(items[i].name)
        itemArr.push(items[i].id)
        itemsListsArr.push(itemsList[i])
    }
    return [nameArr, itemArr, itemsListsArr]
}

//creates buttons based on list contents
function createButtons(list) {
    let listsDiv = document.getElementById("lists")
    let button = document.createElement('button')
    button.dataset.id = list.id
    button.className = "tabLinks"
    button.innerText = list.name

    listsDiv.appendChild(button)
}

//gets item independent of quantity
function getItem(e) {
    if(e!= null){
    let re = /[a-zA-Z]+/
    let text = e.match(re)[0]
    return text
    }
}

//gets quantity from string
function getQuantity(e) {
    let re = /^[0-9]/
    let num = /[^\s]+/
    let quantity = 1
    if (e.match(re)) {
        quantity = e.match(num)[0]
    }
    return quantity
}

//function to create users BROKEN
function makeUser(form){
    let userName = form[0].value
    console.log(userName)
}

//will function once login is correct hopefully
function addList(){
    let name  = document.getElementById("listName").value
    fetch("http://localhost:3000/lists",{
        method:"POST",
        headers: { 'Content-Type': 'application/json', "accept": 'application/json' },
        body: JSON.stringify({name:name})

    }).then(resp=> resp.json()).then( data=> {
        document.getElementById("listName").dataset.listID= data.id
        fetch("http://localhost:3000/user_lists", {
            method: "POST",
            headers: { 'Content-Type': 'application/json', "accept": 'application/json' },
            body: JSON.stringify({list_id: data.id, user_id:
                userID, aaccess:3})
        })
    })
    //reloads lists & content
    loadLists()
}

//adds user to list
function addUser(){

}

//checks if email pwd combination is in db
function check(form) {
let email =form[0].value
let pwd= form[1].value
fetch("http://localhost:3000/users").then(resp.json())
.then(data=>{
    for(const user of data){
        if(user.email === form[0].value && user.password === form[1].value){
            username= user.id
        }
    }
    if(username===""){
        alert("Email or Password is Incorrect")
    }
})
return false
}

//html changing functions

function setLogin(){
    document.getElementsByTagName("main")[0].innerHTML=`<form id="login">
    <h1>LOGIN</h1>
    <input type="email" placeholder="Email Address" id="userid" required />
    <input type="password" placeholder="Password" id="pswrd" required />
    <input type="submit" value="Login" />
</form>
<button onclick="setSignUp()">Sign Up</button>`
}

function setSignUp(){
    document.getElementsByTagName("main")[0].innerHTML=
   ` <form id="login">
    <h1>Sign up</h1>
    <input type="text" placeholder="User Name" id="username" required />
    <input type="email" placeholder="Email Address" id="userid" required />
    <input type="password" placeholder="Password" id="pswrd" required />
    <input type="text" placeholder="First Name" id="firstName" required />
    <input type="text" placeholder="Last Name" id="lastName" required />
    <input type="submit" value="Sign Up" id="signup"/>
</form>`

}

function setApp(){
    document.getElementsByTagName("main")[0].innerHTML=
`  
  <div id= "center">
    <div id="heading">
    <h2 id="header">Lists</h2>
    <button id="listsSearchButton"><i class="fas fa-search"></i></button>
    <input id="listsInput" >
    <br>
    </div>
    <hr>
    <div id="lists" onload="loadLists();">
    </div>
    <div id = "listContent">
    
        <input type="text" class="listInput"></input>
        
        <input type="text" class="listInput"></input>
        
        <input type="text" class="listInput"></input>
      
        <input type="text" class="listInput"></input>
       
        <input type="text" class="listInput"></input>
     
        <input type="text" class="listInput"></input>
      
        <input type="text" class="listInput"></input>
        <input type="text" class="listInput"></input>
        <input type="text" class="listInput"></input>
        <input type="text" class="listInput"></input>
        <input type="text" class="listInput"></input>
        <input type="text" class="listInput"></input>
        <input type="text" class="listInput"></input>
        <input type="text" class="listInput"></input>
        <div id= "B1" class="tabcontent">
    
    </div>
    </div>
    </div> 
    <div id= "addForm"> 
    <h4>New List</h4>
    Name:<input id="listName" class="addinput"></input>
    <button id= "addSubmitButton" onclick="addList()">Submit</button>
    </div>  
    <div id= "addUserForm"> 
    <h4>New User</h4>
    User Name:<input id="listName" class="addinput"></input>
    <button id= "addUserButton" onclick="addUser()">Submit</button>
    </div>  
    <div id="content">
    
    
    </div>
    <div id="toDelete"></div>`
    
}
