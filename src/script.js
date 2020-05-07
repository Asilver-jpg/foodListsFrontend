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

window.onload = function () {
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

        }
    })
  
   let hold_time=300000
    listContent.addEventListener("mousedown", function(e){
        if(e.target.className==="listInput"){
       timeout_id = setInterval(toggle(e), hold_time)
        }
    })
    
    document.addEventListener('mouseup mouseleave', function(){
        timeout_id.clearInterval()
    })
}

window.onbeforeunload = function(){
    deleteItemLists()
}

function toggle(e){
    console.dir(e.target)
    if(e.target.style.textDecoration === ""){
        e.target.style.textDecoration ="line-through"
        e.target.style.color ="gray"
        e.target.dataset.delete =true
    }else{
        e.target.style.textDecoration =""
        e.target.style.color ="black"
        e.target.removeAttribute("data-delete")
    }
}


function setItemToDelete(target, itemList){
    console.log("OK")
}

function updateOrPostItemList(target, itemList) {
    listID = document.getElementsByClassName("active")[0].dataset.id
    let itemName = getItem(target.value)
    let quantity = getQuantity(target.value)
    if (itemList) {
        //update itemList in db
        fetch(`http://localhost:3000/item_lists/${itemList}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ itemListID: itemList, item_name: itemName, list_id: listID, quantity: quantity, note: "" })
        })
        loadListContents()
    } else {
        //post itemList in db
        fetch('http://localhost:3000/item_lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "accept": 'application/json' },
            body: JSON.stringify({ item_name: itemName, list_id: listID, quantity: quantity, note: "" })
        }).then(resp => resp.json()).then(data=>{}).catch((error)=>console.error('Error', error))
        loadListContents()
    }
    loadListContents()
}



function returnList(id) {
    let singleLists = document.getElementsByClassName("singleList");
    for (const list of singleLists) {
        if (list.dataset.id === id) {
            return list
        }
    }
}

function loadLists() {
    let json = getLists().then(data => {
        for (list of data) {
            appendList(list)
            createButtons(list)
        }
    })

}
function loadListContents(){
   const node= document.getElementById("content")
  
   node.innerHTML=""

  
    let json = getLists().then(data=>{
        for(list of data){
        appendList(list)
        }
    })
}
function getLists() {
    return fetch("http://localhost:3000/lists").then(resp => resp.json())
}



function appendList(list) {
    let itemDetails = makeList(list)

    let addString = itemDetails[0].join(",")

    newList = document.createElement("div")
    newList.dataset.items = itemDetails[1].join(",")
    let itemLists = itemDetails[2].map(function (value) { return value.id })
    newList.dataset.itemLists = itemLists.join(",")
    newList.className = "singleList"
    newList.dataset.id = list.id
    newList.innerText = addString;
    document.getElementById("content").appendChild(newList)
}

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


function createButtons(list) {
    let listsDiv = document.getElementById("lists")

    let button = document.createElement('button')
    button.dataset.id = list.id
    button.className = "tabLinks"
    button.innerText = list.name

    listsDiv.appendChild(button)
}

function getItem(e) {
    if(e!= null){
    let re = /[a-zA-Z]+/
    let text = e.match(re)[0]
    return text
    }
}

function getQuantity(e) {
    let re = /^[0-9]/
    let num = /[^\s]+/
    let quantity = 1
    if (e.match(re)) {
        quantity = e.match(num)[0]
    }
    return quantity
}