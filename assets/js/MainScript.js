/*
JavaScript program to add functionality to the Resaurant App website
(c) 2023 BCU S22191219
*/

function redirect(loc = "") { //set the document location to a location specified, causing a redirect.
    document.location = loc;
}

function isEmptyObject(obj) { // Returns true or false depending on if the object is Empty or not.
    return JSON.stringify(obj) === '{}'
}

function showNotification(item) {
    var notificationContainer = document.getElementById("notification-container");
    var notification = document.createElement("div");
    notification.className = "notification";
    notification.innerText = 'You added a ' + item + ' to the basket!';
    notificationContainer.appendChild(notification);
    setTimeout(function() { // After 2 seconds (2000ms)
        notification.style.animation = "fadeOut 0.5s ease-in-out forwards"; // Fade the popup out
        setTimeout(function() { // When the animation is complete remove from DOM (0.5s (500ms))
            notification.remove();
        }, 500);
    }, 2000);
}

function finalize(tot, tnum) { // subroutine that checks if the table number is valid and prompts the user their final amount.
    if (isNaN(tnum)) {
        alert("Please enter a table number!")
    } else {
        alert(`You will be charged £${tot.toFixed(2)}. Your food will be delivered to table number ${tnum}.`);
        setCookie("basket", "r", 0);
        redirect("index.html");
    }
}

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) { // If the cookie can not be found
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) { // we have reached the end of the cookie string
            end = dc.length;
        }
    }
    // because unescape has been deprecated, replaced with decodeURI
    //return unescape(dc.substring(begin + prefix.length, end));
    return decodeURI(dc.substring(begin + prefix.length, end));
}

function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000)); // Get current time and add the expiration date converted to ms.
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/"; // Concatonate the data together to form a valid cookie string. Probably a better way to do this
    // Behold the art of the bodge! (╯°□°)╯
}

function getBasket(read = true, data = {}) {
    var cookie = getCookie("basket")
    if (cookie == null) {
        console.log('cookie null... creating new basket')
        var towrite = [];
        var str = setCookie("basket", towrite, 1);
    }
    if (read == true) { // if we want to read the basket
        if (cookie) {
            var data = JSON.parse(cookie) // convert the JSON string to a variable type
        }
        return data
    } else { // we want to write to the basket
        if (cookie) {
            var current = JSON.parse(cookie) // convert to a JSON validated string
        } else {
            var current = []
        }
        current.push(data);
        var toWrite = JSON.stringify(current);
        setCookie('basket', toWrite, 1);
        console.log(toWrite);
    }
}
/*
#########
MENU PAGE
#########
*/
if (document.URL.includes('/menu.html')) {
    console.log('You are on the Menu page... Awaiting for  user to add to basket');
    // Index through all buttons and add a link that adds the item to the basket cookie.
    var counter = 1;
    var button = document.getElementById("menuButton" + counter);
    while (button) {
        button.addEventListener("click", function(button) {
            var name = button.srcElement.parentElement.children[0].innerText;
            var price = button.srcElement.childNodes[0].wholeText;
            // Match to a regex look for brackets and extract the data between them
            var price = price.match(/\((.*?)\)/);
            if (price) {
                var price = price[1];
            }
            //console.log(name, price);
            var basket = getBasket();
            if (basket == null) { // if the basket cookie does not exist
                console.log('Creating new basket!')
                var towrite = []
                var str = getBasket(false, towrite); // create a new blank basket
                console.log(str);
                return;
            } else {
                console.log(basket);
                console.log(getBasket(false, [name, price]));
            }
            showNotification(name); // Display the notification that the item has been added to the basket
        });
        button = document.getElementById("menuButton" + (++counter)); // get the next button
    }
    /*
    ###########
    BASKET PAGE
    ###########
    */
} else if (document.URL.includes('/basket.html')) {
    console.log('You are on the basket page... Working out total');
    var basket = getBasket()
    console.log(basket);
    if (basket == null) {
        console.log('The basket cookie could not be found!');
        redirect("menu.html"); // If the basket can not be found redirect to menu so it can be created.
        // The user could have been directed here from a previous session.
    } else if (isEmptyObject(basket)) { // If the basket is malformed redirect to menu so it can be recreated.
        redirect("menu.html");
    } else {
        console.log('Basket found and not empty!')
        var table = document.getElementById('BASKET_TABLE').getElementsByTagName('tbody')[0]; // Get the table that holds the basket information
        console.log(table);
        var c = 1
        var tot = 0.0
        for (const item of basket) { // For each item in the basket cookie
            console.log(item);
            var tot = tot + parseFloat(item[1])
            table.insertAdjacentHTML("beforeend", '<tr><td>' + item[0] + '</td><td>' + item[1] + '</td><td><button id="remove' + c + '" class="btn btn-danger" type="button"><i class="far fa-trash-alt d-xl-flex justify-content-xl-center align-items-xl-center"></i></button></td></tr>') // Insert the HTML code for a row in the table before the end of the table
            let button = document.getElementById("remove" + c);
            button.addEventListener("click", function(button) { // Add a listener to the button inside the row that removes the selected item from the basket cookie
                console.log("inside removeItem!")
                console.log(button);
                if (button.target.className.includes('btn')) { // Check if the button was clicked or the icon, if the icon, then get the parent element (the button)
                    var button = button.srcElement
                } else {
                    var button = button.srcElement.parentElement
                }
                console.log(button);
                var index = button.id.replace('remove', '') - 1;
                var basket = getBasket();
                var count = 0
                var out = []
                for (const item of basket) { //remove the item at specified index
                    if (!(count == index)) {
                        out.push(item)
                    }
                    var count = count + 1
                }
                var toWrite = JSON.stringify(out);
                setCookie('basket', toWrite, 1);
                location.reload(true); // reload the page to update the table with the new basket
            });
            var c = c + 1;
        }
    }
    // That's quite a jump, you might be a bit lost.
    // Within these final lines we are updating the final 
    let stat = document.getElementById('total_edit')
    stat.innerHTML = `<b>Total: £${tot.toFixed(2)}<br>Total (+VAT @ 20%): £${((tot * 0.2) + tot).toFixed(2)}</b><br><br>Table Number:`; // VAT is 20% currently
    var confirm = document.getElementById("confirm")
    var table = document.getElementById('form').value
    document.getElementById("confirm").addEventListener("click", function() { // when the confirm button is clicked
        finalize(tot, document.getElementById('form').valueAsNumber) // send the final total (tot) along with the table number to the finalize subroutine
    });
}