var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function() {

    if (tableNumber === null) {
      this.askTableNumber();
    }

    var dishes = await this.getDishes();

    this.el.addEventListener("markerFound", () => {
      if(tableNumber!==null){

      var markerId = this.el.id;
      this.handleMarkerFound(dishes, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  askTableNumber: function() {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    
    swal({
      title:"welscome to hunger",
      icon:iconUrl,
      content:{
        element:"input",
        attributes:{
          placeholder:"type you table number",
          type:"number",
          min:1
        }

      },
        closeOnClickOutside:false,

    }).then(inputvalue=>{
       tableNumber=inputvalue

    })
    
  },

  handleMarkerFound: function(dishes, markerId) {
    // Getting today's day
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    
    // Sunday - Saturday : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    var dish = dishes.filter(dish => dish.id === markerId)[0];

    if (dish.unavailabledays.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.dishname.toUpperCase(),
        text: "This dish is not available today!!!",
        timer: 2500,
        buttons: false
      });
    } else {
       // Changing Model scale to initial scale
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.modelgeometry.position);
      model.setAttribute("rotation", dish.modelgeometry.rotation);
      model.setAttribute("scale", dish.modelgeometry.scale);

      //Update UI conent VISIBILITY of AR scene(MODEL , INGREDIENTS & PRICE)
      model.setAttribute("visible",true)
      var ingridientsContainer=document.querySelector(`#main-plane-${dish.id}`)
      ingridientsContainer.setAttribute("visible",true)
      var pricePlane=document.querySelector(`#price-plane-${dish.id}`)
      pricePlane.setAttribute("visible",true)
      /* REPLACE COMMENTS TO ADD CODE HERE
    
    
      
      
      */

      // Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");
      var sumbutton=document.getElementById("order-summary-button")

      // Handling Click Events
      ratingButton.addEventListener("click", ()=> 
       this.handlerating(dish)

      );

      orderButtton.addEventListener("click", () => {
        var tnumber
        tableNumber<=9?(tnumber=`T0${tableNumber}`):`t${tableNumber}`
        this.handleOrder(tnumber,dish)

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order !",
          text: "Your order will serve soon on your table!",
          timer: 2000,
          buttons: false
        });
      });
        sumbutton.addEventListener("click",()=>
          this.handleordersummary()
        

        )
        paybutton.addEventListener("click",()=>
         this.handlePayment()


        )

    }
  },
    getordersummary:async function(tnumber){
     return await firebase.firestore().collection("tables").doc(tnumber).get().then(doc=>doc.data())




    },



    handleordersummary: async function(){
     var tnumber
     tableNumber<=9?(tnumber=`t0${tableNumber}`):`t${tableNumber}`
     var ordersummary=await this.getordersummary(tnumber)
     var modadiv=document.getElementById("modal-div")
     modadiv.style.display="flex"
     var tablebodytag=document.getElementById("bill-table-body")
     tablebodytag.innerHTML=""
     var currentOrder=Object.keys(ordersummary.currentorders)
     currentOrder.map(i=>{
       var tr=document.createElement("tr")
       var item=document.createElement("td")
       var price=document.createElement("td")
       var quantity=document.createElement("td")
       var subtotal=document.createElement("td")
       item.innerHTML=ordersummary.currentorders[i].item
       price.innerHTML="$"+ordersummary.currentorders[i].price
       price.setAttribute("class","text-center")
       quantity.innerHTML=ordersummary.currentorders[i].quantity
       quantity.setAttribute("class","text-center")
       subtotal.innerHTML="$"+ordersummary.currentorders[i].subtotal
       subtotal.setAttribute("class","text-center")
       tr.appendChild(item)
       tr.appendChild(price)
       tr.appendChild(quantity)
       tr.appendChild(subtotal)
       tablebodytag.appendChild(tr)
      var totalTr = document.createElement("tr"); 
     var td1 = document.createElement("td");
      td1.setAttribute("class", "no-line");
      var td2 = document.createElement("td");
       td1.setAttribute("class", "no-line"); 
       var td3 = document.createElement("td"); 
       td1.setAttribute("class", "no-line text-center"); 
        var strongTag = document.createElement("strong");
         strongTag.innerHTML = "Total"; 
         td3.appendChild(strongTag);
        var td4 = document.createElement("td");
        td1.setAttribute("class", "no-line text-right"); 
        td4.innerHTML = "$" + ordersummary.totalbill;
        totalTr.appendChild(td1);
         totalTr.appendChild(td2);
          totalTr.appendChild(td3);
           totalTr.appendChild(td4); 
            tablebodytag.appendChild(totalTr);

     })




    },
  handleOrder: function(tNumber, dish) {
    firebase .firestore() .collection("tables") .doc(tNumber) .get() .then(doc => 
      { var details = doc.data(); 
        if (details["currentorders"][dish.id]) {
           details["currentorders"][dish.id]["quantity"] += 1; 
           var currentQuantity = details["currentorders"][dish.id]["quantity"]; 
           details["currentorders"][dish.id]["subtotal"] = currentQuantity * dish.price; }
            else { details["currentorders"][dish.id] = { item: dish.dishname, price: dish.price, quantity: 1, subtotal: dish.price * 1 }; } 
           details.totalbill += dish.price;
           firebase .firestore() .collection("tables") .doc(doc.id) .update(details); });
  },
     handlerating:async function(dish){
         var tnumber
         tableNumber<=9?(tnumber=`t0${tableNumber}`):`t${tableNumber}`
         var ordersummary=await this.getordersummary(tnumber)
         var currentorders=Object.keys(ordersummary.currentorders)
         if(currentorders.length>0&&currentorders==dish.id){
        document.getElementById("rating-modal-div").style.display = "flex"; 
        document.getElementById("rating-input").value = "0"; 
        document.getElementById("feedback-input").value = ""; 
     var saveRatingButton = document.getElementById("save-rating-button"); 
     saveRatingButton.addEventListener("click", () => { document.getElementById("rating-modal-div").style.display = "none"; 
 
    var rating = document.getElementById("rating-input").value;
     var feedback = document.getElementById("feedback-input").value;
      firebase .firestore() .collection("dishes") .doc(dish.id) .update({ review: feedback, rating: rating }) .then(() => { swal({ icon: "success", title: "Thanks For Rating!", 
      text: "We Hope You Like Dish !!", timer: 2500, buttons: false }); }); });


         }else{
          swal({ icon: "warning", title: "Oops!",
           text: "No dish found to give ratings!!", 
           timer: 2500, buttons: false }); 



         }


     },





  getDishes: async function() {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function() {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
