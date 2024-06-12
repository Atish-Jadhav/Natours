const $cdc0efe15a234f89$export$4c5dd147b21b9176 = (locations)=>{
    mapboxgl.accessToken = "pk.eyJ1IjoiYXRpc2gzODY2IiwiYSI6ImNseDF3Z2l2azBna28ybHF1MTNyZnQ2NDAifQ.SzSWQRFfPtb-Oh8cmob_HQ";
    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/atish3866/clx30d48c005r01qqanzj9rr4",
        scrollZoom: false
    });
    // This will be the area that will be displayed on the map
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc)=>{
        // Create Marker on locations
        const el = document.createElement("div");
        // In CSS, we have a class of marker
        el.className = "marker";
        // Add a marker inside the mapbox
        new mapboxgl.Marker({
            element: el,
            // Bottom of the element, which in this case is pin, is going to be located at the exact GPS location 
            anchor: "bottom"
        }).setLngLat(loc.coordinates).addTo(map); //In locations document embedded in tours document, locations has coordinates property.
        // Add a popup
        new mapboxgl.Popup({
            // As markers overlap
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    }) //The map in addTo is the map variable above
    ;
    map.fitBounds(bounds, {
        padding: {
            // Specifying padding because of unique style of tour page
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
} // mapboxgl.accessToken = 'pk.eyJ1IjoiYXRpc2gzODY2IiwiYSI6ImNseDF3Z2l2azBna28ybHF1MTNyZnQ2NDAifQ.SzSWQRFfPtb-Oh8cmob_HQ';
 // const map = new mapboxgl.Map({
 // 	container: 'map', // container ID. This will put the map on an element with the id map and we have it in tour.pug
 // 	style: 'mapbox://styles/atish3866/clx30d48c005r01qqanzj9rr4', // style URL
 // 	scrollZoom: false
 // 	// center: [-118.113491, 34.111745], // starting position [lng, lat]
 // 	// zoom: 10, // starting zoom
 // 	// interactive: false
 // });
 // // This will be the area that will be displayed on the map
 // const bounds = new mapboxgl.LngLatBounds();
 // locations.forEach(loc => {
 // 	// Create Marker on locations
 // 	const el = document.createElement('div');
 // 	// In CSS, we have a class of marker
 // 	el.className = 'marker';
 // 	// Add a marker inside the mapbox
 // 	new mapboxgl.Marker({
 // 		element : el,
 // 		// Bottom of the element, which in this case is pin, is going to be located at the exact GPS location 
 // 		anchor: 'bottom'
 // 	}).setLngLat(loc.coordinates).addTo(map); //In locations document embedded in tours document, locations has coordinates property.
 // 	// Add a popup
 // 	new mapboxgl.Popup({
 // 		// As markers overlap
 // 		offset : 30
 // 	}).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
 // 	// Extend map bounds to include current location
 // 	bounds.extend(loc.coordinates);
 // })//The map in addTo is the map variable above
 // map.fitBounds(bounds, {
 // 	padding : {
 // 			// Specifying padding because of unique style of tour page
 // 			top : 200,
 // 			bottom : 150,
 // 			left : 100,
 // 			right : 100
 // 	}
 // });
;


function $cb8ce09cb8bf6e76$export$516836c6a9dfc573() {
    const el = document.querySelector(".alert");
    if (el) el.parentElement.removeChild(el);
}
function $cb8ce09cb8bf6e76$export$de026b00723010c1(type, msg, time = 5) {
    $cb8ce09cb8bf6e76$export$516836c6a9dfc573();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    window.setTimeout($cb8ce09cb8bf6e76$export$516836c6a9dfc573, time * 1000); //5 seconds
}


const $775abdec7d40fe17$export$596d806903d1f59e = async (email, password)=>{
    try {
        const result = await axios({
            method: "POST",
            url: "/api/v1/users/login",
            data: {
                // We expect email and password and the key names are also email and password. Check the endpoint in Postman and then the body.
                email: email,
                password: password
            }
        });
        // The 'data' is the JSON response
        if (result.data.status === "success") {
            (0, $cb8ce09cb8bf6e76$export$de026b00723010c1)("success", "Logged in successfully");
            window.setTimeout(()=>{
                // To load another page
                location.assign("/");
            }, 1500); //1.5 seconds
        }
    } catch (err) {
        (0, $cb8ce09cb8bf6e76$export$de026b00723010c1)("error", err.response.data.message);
    }
};
const $775abdec7d40fe17$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const result = await axios({
            method: "GET",
            url: "/api/v1/users/logout"
        });
        result.data.status = "success"; //true will set reload from server and not browser cache
        location.reload(true);
    } catch (err) {
        console.log(err.message);
        (0, $cb8ce09cb8bf6e76$export$de026b00723010c1)("error", "Error logging out! Try again.");
    }
} // document.querySelector('.form').addEventListener('submit', e => {
 //     e.preventDefault(); //This prevents the form from loading any other page
 //     const email = document.getElementById('email').value;
 //     const password = document.getElementById('password').value;
 //     login(email, password);
 // });
 // document.querySelector('.nav__el.nav__el--logout').addEventListener('click', logout);
;



const $f373eab60812d00c$export$7200a869094fec36 = async (name, email, password, passwordConfirm, role)=>{
    try {
        const res = await axios({
            method: "POST",
            url: "/api/v1/users/signup",
            data: {
                name: name,
                email: email,
                password: password,
                passwordConfirm: passwordConfirm,
                role: role
            }
        });
        if (res.data.status === "success") {
            (0, $cb8ce09cb8bf6e76$export$de026b00723010c1)("success", "Signed up successfully!");
            window.setTimeout(()=>{
                location.assign("/");
            }, 3000);
        }
    } catch (err) {
        // console.log(err.response.data);
        (0, $cb8ce09cb8bf6e76$export$de026b00723010c1)("error", err.response.data.message);
    }
}; // document.querySelector('.form--signup').addEventListener('submit', e => {
 //   e.preventDefault(); //This prevents the form from loading any other page
 //   const name = document.getElementById('name').value;
 //   const email = document.getElementById('email').value;
 //   const password = document.getElementById('password').value;
 //   const passwordConfirm = document.getElementById('passwordConfirm').value
 //   const role = document.getElementById('role').value
 //   signup(name, email, password, passwordConfirm, role);
 // });



const $751a50af865a6d2c$export$f558026a994b6051 = async (data, type)=>{
    try {
        // Depending on type, we'll either be updating only user name and email or just the user password
        const url = type === "password" ? "/api/v1/users/updateMyPassword" : "/api/v1/users/updateMe";
        const result = await axios({
            method: "PATCH",
            url: url,
            data: data
        });
        if (result.data.status === "success") (0, $cb8ce09cb8bf6e76$export$de026b00723010c1)("success", `${type.toUpperCase()} updated successfully!`);
    } catch (err) {
        console.log(err.message);
        (0, $cb8ce09cb8bf6e76$export$de026b00723010c1)("error", err.response.data.message);
    }
};



const $29abee557e7f55a9$var$stripe = Stripe("pk_test_51PPMYw04EOVO7dwcTyZoi5eKobKObOtXYojAjQKtin3z8C4cV1h17nBS9eaZDY1AISIwqYkoCJ2OgUOOqwcFpnbK00kn7dU0uB");
const $29abee557e7f55a9$export$8d5bdbf26681c0c2 = async (tourID)=>{
    try {
        // 1) Get checkout session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourID}`);
        // console.log(session);
        // 2) Create checkout form + charge credit card
        await $29abee557e7f55a9$var$stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        (0, $cb8ce09cb8bf6e76$export$de026b00723010c1)("error", err.message);
    }
};



// DOM ELEMENTS
const $37da9664eaa7cb92$var$mapBox = document.getElementById("map");
const $37da9664eaa7cb92$var$loginForm = document.querySelector(".form--login");
const $37da9664eaa7cb92$var$signupForm = document.querySelector(".form--signup");
const $37da9664eaa7cb92$var$logoutBtn = document.querySelector(".nav__el.nav__el--logout");
const $37da9664eaa7cb92$var$userDataForm = document.querySelector(".form-user-data");
const $37da9664eaa7cb92$var$userPasswordForm = document.querySelector(".form-user-password");
const $37da9664eaa7cb92$var$bookBtn = document.getElementById("book-tour");
// DELEGATION
if ($37da9664eaa7cb92$var$mapBox) {
    const locations = JSON.parse($37da9664eaa7cb92$var$mapBox.dataset.locations);
    // console.log(locations);
    (0, $cdc0efe15a234f89$export$4c5dd147b21b9176)(locations);
}
if ($37da9664eaa7cb92$var$loginForm) $37da9664eaa7cb92$var$loginForm.addEventListener("submit", (e)=>{
    e.preventDefault(); //This prevents the form from loading any other page
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    (0, $775abdec7d40fe17$export$596d806903d1f59e)(email, password);
});
if ($37da9664eaa7cb92$var$signupForm) $37da9664eaa7cb92$var$signupForm.addEventListener("submit", (e)=>{
    e.preventDefault(); //This prevents the form from loading any other page
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    const role = document.getElementById("role").value;
    (0, $f373eab60812d00c$export$7200a869094fec36)(name, email, password, passwordConfirm, role);
});
if ($37da9664eaa7cb92$var$logoutBtn) $37da9664eaa7cb92$var$logoutBtn.addEventListener("click", (0, $775abdec7d40fe17$export$a0973bcfe11b05c9));
if ($37da9664eaa7cb92$var$userDataForm) $37da9664eaa7cb92$var$userDataForm.addEventListener("submit", (e)=>{
    e.preventDefault(); //This prevents the form from loading any other page
    const form = new FormData();
    // Because of photo we do it like this
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);
    // console.log(form);
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // updateSettings({name, email}, 'data');
    (0, $751a50af865a6d2c$export$f558026a994b6051)(form, "data");
});
if ($37da9664eaa7cb92$var$userPasswordForm) $37da9664eaa7cb92$var$userPasswordForm.addEventListener("submit", async (e)=>{
    e.preventDefault(); //This prevents the form from loading any other page
    // Password updating takes time due to encryption process so while password updates, show this nice UI
    document.querySelector(".btn--save-password").textContent = "Updating...";
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await (0, $751a50af865a6d2c$export$f558026a994b6051)({
        passwordCurrent: passwordCurrent,
        password: password,
        passwordConfirm: passwordConfirm
    }, "password");
    // After updatiion has been done, change the button text back to original
    document.querySelector(".btn--save-password").textContent = "Save password";
    // To clear the password fields after password has been updated
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
});
if ($37da9664eaa7cb92$var$bookBtn) $37da9664eaa7cb92$var$bookBtn.addEventListener("click", (e)=>{
    // e.target is the element that was clicked/triggered this event listener
    // In pug in data attribute it is written as tour-id, in javascript whenever there is a -, it will automatically be converted to camel case
    e.target.textContent = "Processing...";
    const tourID = e.target.dataset.tourId;
    (0, $29abee557e7f55a9$export$8d5bdbf26681c0c2)(tourID);
});
const $37da9664eaa7cb92$var$alertMessage = document.querySelector("body").dataset.alert;
if (alert) (0, $cb8ce09cb8bf6e76$export$de026b00723010c1)("success", $37da9664eaa7cb92$var$alertMessage, 20);


//# sourceMappingURL=bundle.js.map
