let cl = console.log;

const todo_container = document.getElementById("todo_container");
const spinner = document.getElementById("spinner");
const todo_form = document.getElementById("todo_form");
const todo_item = document.getElementById("todo_item");
const todo_des = document.getElementById("todo_des");
const todo_iscompleted = document.getElementById("todo_iscompleted");
const add_btn = document.getElementById("add_btn");
const update_btn = document.getElementById("update_btn");

const base_url = "https://posts-50d7d-default-rtdb.firebaseio.com/";
const todos_url =
  "https://posts-50d7d-default-rtdb.firebaseio.com/todosacc.json";

let state = {
  todoArr: [],
  update_id: null,
};

function spinnerhand(flag) {
  if (flag) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
}

function snackbar(msg, Icon) {
  Swal.fire({
    title: msg,
    icon: Icon,
    draggable: true,
    timer: 3000,
  });
}

function NestobjtoArr(obj) {
  for (const key in obj) {
    obj[key].id = key;
    state.todoArr.push(obj[key]);
  }
}

async function fetchtodo() {
  try {
    spinnerhand(true);
    let res = await fetch(todos_url, {
      method: "GET",
      body: null,
      headers: {
        "content-type": "applicatin json",
        "auth": "JWT tokens",
      },
    });
    if (!res.ok) {
      throw new Error(err);
    }
    let data = await res.json();
    NestobjtoArr(data);
    onread(state.todoArr);
  } catch (err) {
    cl(err);
  } finally {
    spinnerhand();
  }
}

fetchtodo();

function onread(arr) {
  let result = "";

  arr.forEach((todo) => {
    result += `<li class="list-group-item" id="${todo.id}">
                  <div class="accordion" id="accordionExample">
                    <div class="card">
                      <div class="card-header" id="headingOne">
                        <h2 class="mb-0 d-flex justify-content-between">
                            <button
                            class="btn btn-link btn-lg btn-block text-left"
                            type="button"
                            data-toggle="collapse"
                            data-target="#collapseOne-${todo.todoid}"
                            aria-expanded="true"
                            aria-controls="collapseOne"
                            >
                            <input onchange="oncheck(this)" onclick="event.stopPropagation()" type="checkbox" ${todo.iscompleted ? 'checked' : ''} style="width:15px; height:15px;">
                           <strong>${todo.todoitem}</strong> 

                          </button>
                          <div class="d-flex justify-content-between m-1">
                            <button onclick="onedithand(this)" class="btn btn-sm btn-info ">Edit</button>
                            <button onclick="ondeletehand(this)" class="btn btn-sm btn-warning ml-2">Delete</button>
                          </div>
                        </h2>
                      </div>

                      <div
                        id="collapseOne-${todo.todoid}"
                        class="collapse"
                        aria-labelledby="headingOne"
                        data-parent="#todo_container"
                      >
                        <div class="card-body">
                         ${todo.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>`;
  });

  todo_container.innerHTML = result;
}

async function onsubmit(eve) {
  try {
    eve.preventDefault();
    spinnerhand(true);

    let new_todo = {
      todoitem: todo_item.value,
      description: todo_des.value,
      iscompleted: todo_iscompleted.value === "Yes",
      todoid: Date.now(),
    };
    let res = await fetch(todos_url, {
      method: "POST",
      body: JSON.stringify(new_todo),
      headers: {
        "content-type": "applicatin json",
        "auth": "JWT tokens",
      },
    });
    if (!res.ok) {
      throw new Error(err);
    }

    let data = await res.json();
    new_todo.id = data.name;

    state.todoArr.push(new_todo);
    let li = document.createElement("li");

    li.id = data.name;

    li.className = "list-group-item";
    li.innerHTML = `<div class="accordion" id="accordionExample">
                    <div class="card">
                      <div class="card-header" id="headingOne">
                        <h2 class="mb-0 d-flex justify-content-between">
                            <button
                            class="btn btn-link btn-lg btn-block text-left"
                            type="button"
                            data-toggle="collapse"
                            data-target="#collapseOne-${new_todo.todoid}"
                            aria-expanded="true"
                            aria-controls="collapseOne"
                            >
                            <input onchange="oncheck(this)" onclick="event.stopPropagation()" type="checkbox" ${new_todo.iscompleted ? 'checked' : ''}  style="width:15px; height:15px;">
                           <strong>${new_todo.todoitem}</strong> 

                          </button>
                          <div class="d-flex justify-content-between m-1">
                            <button onclick="onedithand(this)" class="btn btn-sm btn-info">Edit</button>
                            <button onclick="ondeletehand(this)" class="btn btn-sm btn-warning ml-2">Delete</button>
                          </div>
                        </h2>
                      </div>

                      <div
                        id="collapseOne-${new_todo.todoid}"
                        class="collapse"
                        aria-labelledby="headingOne"
                        data-parent="#accordionExample"
                      >
                        <div class="card-body">
                         ${new_todo.description}
                        </div>
                      </div>
                    </div>
                  </div>`;

    todo_container.append(li);
    snackbar(`Todo with id ${data.name} is added successfully`, "success");
    todo_form.reset();
  } catch (err) {
    cl(err);
  } finally {
    spinnerhand();
  }
}

async function ondeletehand(ele) {
  try {
    let alert = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (alert.isConfirmed) {
      spinnerhand(true);
      let dlt_id = ele.closest("li").id;
      let dlt_url = `${base_url}/todosacc/${dlt_id}.json`;

      let res = await fetch(dlt_url, {
        method: "DELETE",
        headers: {
          "content-type": "applicatin json",
          auth: "JWT tokens",
        },
      });
      if (!res.ok) {
        throw new Error(err);
      }
       if(!res.ok){
        throw new Error("err")
       }
      let data = await res.json();
      let findidx = state.todoArr.findIndex((ele) => ele.id === dlt_id);
      state.todoArr.splice(findidx, 1);
      ele.closest("li").remove();

      snackbar(
        `Your todo with id ${dlt_id} is deleted successfully`,
        "success",
      );
    }
  } catch (err) {
    cl(err);
  } finally {
    spinnerhand();
  }
}

async function onedithand(ele) {
  try{
     spinnerhand(true)
     add_btn.classList.add("d-none")
     update_btn.classList.remove("d-none")
     let edit_id = ele.closest("li").id;
     state.update_id=edit_id
     let edit_url=`${base_url}/todosacc/${edit_id}.json`

    let res = await fetch(edit_url,{
                  method:"GET",
                  headers:{
                     "content-type": "applicatin json",
                      "auth": "JWT tokens",
                    }
  })
    if(!res.ok){
      throw new Error("err");
      
    }
     let data= await res.json()
    todo_item.value=data.todoitem;
     todo_des.value = data.description;
     todo_iscompleted.value = data.iscompleted ? "Yes": "No"
     
  }
  catch(err){
   cl(err)
  }
  finally{
    spinnerhand()
  }
}

async function onupdatehand(){
 try{
  spinnerhand(true)
  let update_id = state.update_id
  let old_obj= state.todoArr.find(e=>e.id===update_id)
 
  let updated_obj= {
                     todoitem: todo_item.value,
                     description: todo_des.value,
                     iscompleted: todo_iscompleted.value === "Yes",
                     todoid: old_obj.todoid,
                     id:update_id
  }

  let update_url = `${base_url}/todosacc/${update_id}.json`

  let res = await fetch(update_url,{
    method:"PATCH",
    body:JSON.stringify(updated_obj),
    headers:{
         "content-type": "applicatin json",
         "auth": "JWT tokens",
    }
  })
   if(!res.ok){
    throw new Error("err")
   }
   let data = await res.json()
   let find_idx= state.todoArr.findIndex(c=>c.id===update_id);
   state.todoArr[find_idx]= updated_obj;
    let update_li= document.getElementById(update_id)
     update_li.innerHTML=`<div class="accordion" id="accordionExample">
                    <div class="card">
                      <div class="card-header" id="headingOne">
                        <h2 class="mb-0 d-flex justify-content-between">
                            <button
                            class="btn btn-link btn-lg btn-block text-left"
                            type="button"
                            data-toggle="collapse"
                            data-target="#collapseOne-${updated_obj.todoid}"
                            aria-expanded="true"
                            aria-controls="collapseOne"
                            >
                            <input onchange="oncheck(this)" onclick="event.stopPropagation()" type="checkbox" ${updated_obj.iscompleted ? 'checked' : ''}  style="width:15px; height:15px;">
                           <strong>${updated_obj.todoitem}</strong> 

                          </button>
                          <div class="d-flex justify-content-between m-1">
                            <button onclick="onedithand(this)" class="btn btn-sm btn-info ">Edit</button>
                            <button onclick="ondeletehand(this)" class="btn btn-sm btn-warning ml-2">Delete</button>
                          </div>
                        </h2>
                      </div>

                      <div
                        id="collapseOne-${updated_obj.todoid}"
                        class="collapse"
                        aria-labelledby="headingOne"
                        data-parent="#todo_container"
                      >
                        <div class="card-body">
                         ${updated_obj.description}
                        </div>
                      </div>
                    </div>
                  </div>`

                  todo_form.reset();
                  add_btn.classList.remove("d-none")
                  update_btn.classList.add("d-none")
              
                  snackbar(`your todo with id ${update_id} updated successfully`,"success")
 }
 catch(err){
  cl(err)
 }
 finally{
   spinnerhand()
 }
}



async function oncheck(ele){
   try{
      spinnerhand(true)
   let check_id= ele.closest("li").id
   let check_url= `${base_url}/todosacc/${check_id}.json`

   let checkobj = {
      iscompleted : ele.checked
   }
   

      let res = await fetch(check_url, {
        method:"PATCH",
        body:JSON.stringify(checkobj),
        headers:{
           "content-type": "applicatin json",
           "auth": "JWT tokens",
        }
      })

      if(!res.ok){
        throw new Error("err")
      }
      let data= await res.json()
      let idx = state.todoArr.findIndex(e => e.id === check_id)
      state.todoArr.iscompleted = checkobj.iscompleted
   }
   catch(err){
     cl(err)
   }
   finally{
    spinnerhand()
   }
      
      

}



update_btn.addEventListener("click",onupdatehand)
todo_form.addEventListener("submit", onsubmit);
