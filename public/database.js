
var cellHeaders = ["Exercise", "Weight", "Reps", "Unit", "Date"];

$(document).ready(function() {
	getData();
});


var newExercise = document.getElementById('newExercise');

// Bind submit button for new exercises to AJAX post request
$(newExercise).submit(function(event) {
	event.preventDefault();
	var newData = $(newExercise).serialize();
	$.ajax({
		type: "POST",
		url: "/",
		data: newData
	}).done(function (response) {
		newExercise.reset();
		getData();
	});
});

// Bind delete buttons - send AJAX request to delete path, then refresh page with updated data
$("#tableSQL").on("submit", ".dltbtns", function(event) {
	event.preventDefault();
	var deletedata = $(this).serialize();
		$.ajax({
			type: "GET",
			url: "/delete",
			data: deletedata
		}).done(function (response) {
			getData();
		});
});

// Bind submit buttons
$("#tableSQL").on("submit", ".edtbtns", function(event) {
	event.preventDefault();
	var updatedExercise = {};
	var parentRow = $(this).parent().parent()[0];
	var empty = false;

	// Get text insides each cell of the form
	updatedExercise.id = this.elements["id"].value;
	updatedExercise.name = $(parentRow.children[0].children[0]).text();
	updatedExercise.weight = $(parentRow.children[1].children[0]).text();
	updatedExercise.reps = $(parentRow.children[2].children[0]).text();
	updatedExercise.lbs = $(parentRow.children[3].children[0]).text();
		if (updatedExercise.lbs == "lbs" || updatedExercise.lbs == "lb") {
			updatedExercise.lbs = "1";
		} else 
			updatedExercise.lbs = "0";
		}
	updatedExercise.date = $(parentRow.children[4].children[0]).text();

	// Check if any fields are empty
	for (var prop in updatedExercise) {
		if (updatedExercise[prop].trim().length == 0) {
			empty = true;
		}
	}
	if (empty) {
		alert("Please fill in all fields before updating.");
	} else {    // Everything has been filled out, proceed to AJAX request
		$.ajax({
			type: "GET",
			url: "/update",
			data: updatedExercise
		}).done(function (response) {
			getData();
			alert("Successfully updated");
		});
	}
});

function getData() {
	// AJAX request to server to retrieve database information
	$.get("http://flip3.engr.oregonstate.edu:4574/data", function(response) {
		var res = JSON.parse(response);
		
		var table = document.createElement("table");
		var header = table.createTHead();
		var tbody = table.createTBody();
		var headRow = header.insertRow(0);
		
		// Populate header
		for (var h = 0; h < cellHeaders.length; h++) {
			var headCell = headRow.insertCell(h);
			headCell.className = cellHeaders[h] + "Col";
			headCell.textContent = cellHeaders[h];
		}
		// Populate body
		for (var r = 0; r < res.length; r++) {
			var rowObj = res[r];
			var contentRow = tbody.insertRow(r);
			var propArr = Object.keys(rowObj);

			for (var i = 0; i < cellHeaders.length; i++) {
				var contentCell = contentRow.insertCell(i);
				var cellData = rowObj[propArr[i+1]];
				if (i == 3) {                    // If on unit column
					if (cellData === 1) {
						cellData = "lbs";
					} else {
						cellData = "kgs";
					}
				}
				contentCell.innerHTML = "<div contenteditable='true'>"+cellData+"</div>";
			}
			// Add edit and delete buttons
			
			// Add edit button
			var editCell = contentRow.insertCell(cellHeaders.length);
			editCell.className = "buttoncells";
			var editButton = document.createElement("form");
			editButton.method = "post";
			editButton.action = "/update";
			editButton.className = "edtbtns";
			var editID = document.createElement("input");
			editID.type = "hidden";
			editID.name = "id";
			editID.value = rowObj['id'];
			var editSubmit = document.createElement("input");
			editSubmit.type = "submit";
			editSubmit.value = "Update";
			editButton.appendChild(editID);
			editButton.appendChild(editSubmit);
			editCell.appendChild(editButton);			
			
	
			// Add delete button
			var deleteCell = contentRow.insertCell(cellHeaders.length+1);
			deleteCell.className = "buttoncells";
			var deleteButton = document.createElement("form");
			deleteButton.method = "get";
			deleteButton.action = "/delete";
			deleteButton.className = "dltbtns";
			var deleteID = document.createElement("input");
			deleteID.type = "hidden";
			deleteID.name = "id";
			deleteID.value = rowObj['id'];
			var deleteSubmit = document.createElement("input");
			deleteSubmit.type = "submit";
			deleteSubmit.value = "Delete";
			deleteButton.appendChild(deleteID);
			deleteButton.appendChild(deleteSubmit);	
			deleteCell.appendChild(deleteButton);

		}
		
		// Append table to webpage
		var tablePlaceholder = document.getElementById('tableSQL');
		if (tablePlaceholder.hasChildNodes()) {
			tablePlaceholder.replaceChild(table, tablePlaceholder.childNodes[0]);
		} else {
			tablePlaceholder.appendChild(table);
		}
});
}






