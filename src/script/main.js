const filter_box = document.querySelector('.header__search-box');

const filter_list = document.querySelector(".filter__list");
const jobs_container = document.querySelector(".jobs__container");

let jobsData;
let url = 'http://localhost:8080/data.json';
var top_box = document.querySelector('.header__search-box');
let filters = [];




fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network failed " + response.status + ": " + response.statusText)
        }
        return response.json()
    })
    .then(data => {
        jobsData = data;
        initialize()
    })
    .catch(err => {
        console.log("Network request failed with response " + err.status + ": " + err.statusText);
    })


const template = document.createElement("template");
template.innerHTML = `
    <article class="job">
        <!-- LOGO  -->
        <div class="logo">
            <img src="" alt="" class="logo__image">
        </div>
        <!-- ROLE  -->
        <div class="role">
            <div class="flex">
                <div class="role__title-wrapper">
                    <div class="role__company-wrapper">
                        <h3 class="role__company"></h3>
                        <p class="role__status role__status-new">
                            New!
                        </p>

                        <p class='role__status role__status-featured'>
                            Featured
                        </p>
                    </div>

                    <div class="job__role-wrapper">
                        <h1 class="job__position"></h1>
                       
                    </div>
                    <div class="job__post-time-wrapper">
                        <span class="job__post-time job__info "></span>
                        <span class="tittle job__info">.</span>
                        <span class="job__duration job__info"></span>
                        <span class="tittle job__info">.</span>
                        <span class="job__location job__info"></span>
                    </div>

                </div>
                <hr class="job__horizontal-rule">

                <!-- SKILLS -->
                <div class="job__keys">
                </div>
            </div>
    </article>  
 `


function initialize() {

    updateDisplay(jobsData);

    function updateDisplay(jobsToDisplay) {
        for (let i = 0; i < jobsToDisplay.length; i++) {
            showJob(jobsToDisplay[i]);
        }
    }

    listen_for_keys()

    function listen_for_cancel_keys(keys) {
        const cancel_btns = Array.from(document.querySelectorAll('.filter__button'));
        console.log(cancel_btns)
        for (let btn of cancel_btns) {
            btn.addEventListener("click", () => {
                if (cancel_btns.length == 1) filter_box.style.display = "";
                jobs_container.innerHTML = "";
                console.log('I was clicked')
                btn.parentElement.remove();
                filters = filters.filter(f => f !== btn.dataset.key);
                // cancel_btns.forEach(btn => btn.removeEventListener("click", () => {}))
                updateDisplay(filterJobs(jobsData, filters));

                listen_for_keys();
                // btn.removeEventListener("click", () => { console.log("removed") });

            })
        }


        const clear_btn = document.querySelector(".filter__box_button");

        clear_btn.addEventListener('click', () => {
            console.log(jobsData.length);
            filters.length = 0;
            filter_box.style.display = filter_list.innerHTML = jobs_container.innerHTML = "";
            console.log(jobsData)
            updateDisplay(jobsData);
            keys.forEach(k => k.removeEventListener("click", () => { console.log("removed") }))
            listen_for_keys();
        })

    }





    function listen_for_keys() {

        const job_keys = document.querySelectorAll(".job__key");
        for (let key of job_keys) {
            key.addEventListener('click', () => {
                job_keys.forEach(key => key.removeEventListener('click', () => { console.log('removed') }))

                if (filter_box.style.display === "") filter_box.style.display = "flex";

                if (!filters.includes(key["data-key-value"])) {
                    filter_list.appendChild(buildFilter(key["data-key-value"]));
                    filters.push(key["data-key-value"])
                        // console.log(filters)
                };
                console.log(jobs_container)
                job_keys.forEach(key => key.removeEventListener('click', () => { console.log('removed') }))

                jobs_container.innerHTML = '';
                job_keys.forEach(key => key.removeEventListener('click', () => { console.log('removed') }))

                updateDisplay(filterJobs(jobsData, filters));
                console.log(jobsData);
                job_keys.forEach(key => key.removeEventListener('click', () => { console.log('removed') }))
                listen_for_keys();
                listen_for_cancel_keys(job_keys);
            })

        }
    }

}

function buildFilter(name) {
    const li = document.createElement('li');
    let li_template = `
    <span class="filter__key " data-key=${name}>
       ${name}
    </span>
    <span class="filter__button" data-key=${name}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path fill="#FFF" fill-rule="evenodd" d="M11.314 0l2.121 2.121-4.596 4.596 4.596 4.597-2.121 2.121-4.597-4.596-4.596 4.596L0 11.314l4.596-4.597L0 2.121 2.121 0l4.596 4.596L11.314 0z"/></svg></span>
    `
    li.classList.add("filter__list-item");
    li.dataset.key = name;
    li.innerHTML = li_template;
    return li;

}

function filterJobs(jobs, a) {
    let filters = a;
    console.log(filters)
    const jobstoDisplay = jobs.filter(job => {
        let details = [job.role, job.level, ...job.tools, ...job.languages]
        for (let filter of filters) {
            if (!details.includes(filter)) return false;
        }
        return true;
    })
    console.log(jobstoDisplay);
    return jobstoDisplay;
}


function showJob(job) {
    clone = document.importNode(template.content, true);
    var $ = function(name) {
        return clone.querySelector(name);
    }
    let job_filter_keys = [job.role, job.level, ...job.tools, ...job.languages]
    const job_keys = $(".job__keys");
    $(".role__company").textContent = job.company;
    $(".logo__image").src = job.logo;
    $(".job__position").textContent = job.position;
    $(".job__post-time").textContent = job.postedAt;
    $(".job__duration").textContent = job.contract;
    $(".job__location").textContent = job.location;


    if (job.featured && job.new) {
        $(".job").classList = "job job-border--left "
    }
    if (!job.featured) {
        $('.role__status-featured').style.display = "none"
    }
    if (!job.new) {
        $('.role__status-new').style.display = "none"
    }

    for (let job_filter_key of job_filter_keys) {
        let key = document.createElement('p');
        key.className = "job__key";
        key['data-key-value'] = key.textContent = job_filter_key;
        job_keys.appendChild(key)
    }
    document.querySelector(".jobs__container").appendChild(clone);
}