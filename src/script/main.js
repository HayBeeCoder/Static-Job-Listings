const filter_box = document.querySelector('.header__search-box');
const filter_list = document.querySelector(".filter__list");
const jobs_container = document.querySelector(".jobs__container");

let jobsData;
let url = 'http://localhost:8080/data.json';
var top_box = document.querySelector('.header__search-box');
let filters = [];
const template = document.createElement("template");



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
    listen_for_keys();

    function updateDisplay(jobsToDisplay) {
        // displays each job card 
        for (let i = 0; i < jobsToDisplay.length; i++) {
            showJob(jobsToDisplay[i]);
        }
    }



    function listen_for_cancel_keys() {
        let cancel_btns = Array.from(document.querySelectorAll('.filter__button'));
        const clear_btn = document.querySelector(".filter__box_button");

        for (let btn of cancel_btns) {
            // adds listener for click on all cancel buttons
            btn.addEventListener("click", () => {
                // removes clicked cancel button from  cancel buttons array
                console.log(cancel_btns.length)
                    // BUGS ;LSKFJKSDJ
                filters = filters.filter(f => f !== btn.dataset.key);
                console.log(cancel_btns);
                cancel_btns.splice(cancel_btns.indexOf(btn), 1);
                console.log(cancel_btns);
                if (cancel_btns.length == 0) filter_box.style.display = "";



                // clears container holding all jobs to redraw filtered jobs 
                jobs_container.innerHTML = "";
                // removes filter that contains the clicked button from filter box
                btn.parentElement.remove();
                // updates filters 

                updateDisplay(filterJobs(jobsData, filters));
                // listens for  clicks on job keys 
                listen_for_keys();
            })
        }

        clear_btn.addEventListener('click', () => {
            // clears filters content 
            filters = [];
            filter_box.style.display = filter_list.innerHTML = jobs_container.innerHTML = "";
            updateDisplay(jobsData);
            listen_for_keys();
        })
    }





    function listen_for_keys() {

        const job_keys = document.querySelectorAll(".job__key");
        for (let key of job_keys) {
            key.addEventListener('click', () => {
                //on job key press , shows the filter_box at the heading
                if (filter_box.style.display === "") filter_box.style.display = "flex";

                // avoid duplicating filter box's contents
                if (!filters.includes(key["data-key-value"])) {
                    filter_list.appendChild(buildFilter(key["data-key-value"]));
                    filters.push(key["data-key-value"])
                };
                jobs_container.innerHTML = '';
                updateDisplay(filterJobs(jobsData, filters));
                // listens for clicks on other keys
                listen_for_keys();
                // listens for clicks on other cancel keys
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

    const jobstoDisplay = jobs.filter(job => {
        let details = [job.role, job.level, ...job.tools, ...job.languages]
        for (let filter of filters) {
            if (!details.includes(filter)) return false;
        }
        return true;
    })

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