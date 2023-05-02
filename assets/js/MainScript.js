function redirect(loc = "") {
    document.location = loc;
}

function isEmptyObject(obj) {
    return JSON.stringify(obj) === '{}'
}

function showNotification(item) {
    var notificationContainer = document.getElementById("notification-container");
    var notification = document.createElement("div");
    notification.className = "notification";
    notification.innerText = 'You added a ' + item + ' to the basket!';
    notificationContainer.appendChild(notification);
    setTimeout(function() {
        notification.style.animation = "fadeOut 0.5s ease-in-out forwards";
        setTimeout(function() {
            notification.remove();
        }, 500);
    }, 2000);
}

function finalize(tot, tnum) {
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
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
            end = dc.length;
        }
    }
    // because unescape has been deprecated, replaced with decodeURI
    //return unescape(dc.substring(begin + prefix.length, end));
    return decodeURI(dc.substring(begin + prefix.length, end));
}

function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/"; // SameSite=None needed to stop the 
}

function getBasket(read = true, data = {}) {
    var cookie = getCookie("basket")
    if (cookie == null) {
        console.log('cookie null... creating new basket')
        var towrite = [];
        var str = setCookie("basket", towrite, 1);
    }
    if (read == true) {
        if (cookie) {
            var data = JSON.parse(cookie)
        }
        return data
    } else {
        if (cookie) {
            var current = JSON.parse(cookie)
        } else {
            var current = []
        }
        current.push(data);
        var toWrite = JSON.stringify(current);
        setCookie('basket', toWrite, 1);
        console.log(toWrite);
    }
}

//console.log(document);
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
            if (basket == null) {
                console.log('Creating new basket!')
                var towrite = []
                var str = getBasket(false, towrite);
                console.log(str);
                return;
            } else {
                console.log(basket);
                console.log(getBasket(false, [name, price]));
            }
            showNotification(name);
        });
        button = document.getElementById("menuButton" + (++counter));
    }

} else if (document.URL.includes('/basket.html')) {
    console.log('You are on the basket page... Working out total');
    var basket = getBasket()
    console.log(basket);
    if (basket == null) {
        console.log('The basket cookie could not be found!');
        redirect("menu.html");
    } else if (isEmptyObject(basket)) {
        redirect("menu.html");
    } else {
        console.log('Basket found and not empty!')
        var table = document.getElementById('BASKET_TABLE').getElementsByTagName('tbody')[0];
        console.log(table);
        var c = 1
        var tot = 0.0
        for (const item of basket) {
            console.log(item);
            var tot = tot + parseFloat(item[1])
            table.insertAdjacentHTML("beforeend", '<tr><td>' + item[0] + '</td><td>' + item[1] + '</td><td><button id="remove' + c + '" class="btn btn-danger" type="button"><i class="far fa-trash-alt d-xl-flex justify-content-xl-center align-items-xl-center"></i></button></td></tr>')
            let button = document.getElementById("remove" + c);
            button.addEventListener("click", function(button) {
                console.log("inside removeItem!")
                console.log(button);
                if (button.target.className.includes('btn')) {
                    var button = button.srcElement
                } else {
                    var button = button.srcElement.parentElement
                }
                console.log(button);
                var index = button.id.replace('remove', '') - 1;
                var basket = getBasket();
                var count = 0
                var out = []
                for (const item of basket) {
                    if (!(count == index)) {
                        out.push(item)
                    }
                    var count = count + 1
                }
                var toWrite = JSON.stringify(out);
                setCookie('basket', toWrite, 1);
                location.reload(true);
            });
            var c = c + 1;
        }
    }
    let stat = document.getElementById('total_edit')
    stat.innerHTML = `<b>Total: £${tot.toFixed(2)}<br>Total (+VAT @ 20%): £${((tot*0.2)+tot).toFixed(2)}</b><br><br>Table Number:`;
    var confirm = document.getElementById("confirm")
    var table = document.getElementById('form').value
    document.getElementById("confirm").addEventListener("click", function() {
        finalize(tot, document.getElementById('form').valueAsNumber)
    });
}