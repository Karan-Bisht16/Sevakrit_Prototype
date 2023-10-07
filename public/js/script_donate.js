const errorDiv = document.querySelector("#error");
const options = document.querySelector("#option");
const eventDiv = document.querySelector("#eventDiv");

options.addEventListener('change', ()=>{
    if (options.value==='Food'){
        eventDiv.classList.remove('hidden');
    } else {
        eventDiv.classList.add('hidden');
    }
});

function reverseGeocode(postionString) {
    const coordinates = postionString.split('_');
    const lat = parseFloat(coordinates[0].trim());
    const lng = parseFloat(coordinates[1].trim());

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.display_name) {
          document.querySelector('#humanReadableAddress').textContent = data.display_name;
        } else {
          alert('Location not found');
        }
      })
      .catch(error => console.error('Error fetching URL:', error));
  }

const locResultDiv = document.querySelector("#locResult");
const currLocRadio = document.querySelector("#currLoc");
const addrTextArea = document.querySelector("#addressTextArea");
currLocRadio.addEventListener('change', ()=>{
    addrTextArea.value = '';
    addrTextArea.required = false;
    if (document.querySelector("input[type=checkbox]:checked")){
        const currentPosition = currLocRadio.getAttribute('location');
        if (currentPosition===''){
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    document.querySelector("#lat").textContent = latitude;
                    document.querySelector("#lng").textContent = longitude;
                    reverseGeocode(latitude+'_'+longitude);
                    locResultDiv.classList.remove('hidden'); 
                    console.log('User location [just calc.]:', `Latitude: ${latitude}, Longitude: ${longitude}`);
                },
                (error) => {
                    alert('Please enable location');
                    currLocRadio.checked = false;
                });
        } else {
            reverseGeocode(currentPosition);
            const postionArr = currentPosition.split('_');
            document.querySelector("#lat").textContent = postionArr[0].trim();
            document.querySelector("#lng").textContent = postionArr[1].trim();
            console.log('User location [via server]:', `Latitude: ${postionArr[0]}, Longitude: ${postionArr[1]}`);
            locResultDiv.classList.remove('hidden');
        }
    } else {
        locResultDiv.classList.add('hidden');
    }
});

addrTextArea.addEventListener('keyup',()=>{
    currLocRadio.checked = false;
    locResultDiv.classList.add('hidden');
    addrTextArea.required = true;
});

const submitBtn = document.querySelector("#submitBtn");
submitBtn.addEventListener('click', async (event)=>{
    event.preventDefault;
    formObject = {
        name: document.querySelector("#userName").value,
        dateOfDonation: document.querySelector("#dateOfDonation").value,
        mobileNumber: document.querySelector("#mobileNumber").value,
        typeOfDonation: options.value
    };
    if (options.value==='Food') {
        Object.assign(formObject, {typeOfEvent: document.querySelector("#eventType").value});
    }
    if (addrTextArea.value===''){
        currentPosition = {
            latitude: document.querySelector("#lat").textContent,
            longitude: document.querySelector("#lng").textContent
        };
        Object.assign(formObject, {position: currentPosition});
    } else {
        Object.assign(formObject, {position: addrTextArea.value});
    }

    try {
        const currentURL = window.location.href+'/submit';
        const response = await fetch(currentURL, {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formObject)
        });
        const url = await response.json();
        if (url["error"]){
            errorDiv.textContent = url["error"];
            errorDiv.classList.remove('hidden');
            setTimeout(()=>{
                errorDiv.classList.add('hidden');
            },1000);
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error("Error in adding to server ",error);
        return false;
    }
});