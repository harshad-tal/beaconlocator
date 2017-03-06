var frozen_markers = [];
var current_marker;
var map = $("#map");

$(document).ready(function() {
    var dialog;
    load_db_beacons();
    load_ls_beacons();

    dialog = $("#dialog-form").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Create new beacon": function() {
                addBeacon();
                dialog.dialog("close");
            },
            Cancel: function() {
                dialog.dialog("close");
                $('.marker').hide();
            }
        },
        close: function() {},
        position: {
            my: "right",
            of: $('.marker')
        }
    });

    $('#map').click(function(e) {
        x = e.pageX - ( $(window).width() / 10 ) - 24;
        y = e.pageY - 48
        $('.marker').css('left', x).css('top', y).show();
        $("#x_position").val(x);
        $("#y_position").val(y);
        dialog.dialog("open");
    });
});


function addBeacon() {
    var csrftoken = getCookie('csrftoken');

    add_to_local_storage({
        "beacon_id": $("#beacon_id").val(),
        "beacon_name": $("#beacon_name").val(),
        "x_position": parseInt($("#x_position").val()),
        "y_position": parseInt($("#y_position").val())
    });
}

function add_to_local_storage(data){
    var beacons = [];
    if (data.beacon_id !== ''){
        if(localStorage.getItem('beacons') == null){
            beacons.push(data);
            write_local_storage('beacons', beacons);
        } else{
            beacons = read_local_storage('beacons');
            beacons.push(data);
            write_local_storage('beacons', beacons);
        }
        add_beacon_marker();
    } else {
        console.log('blank input');
    }
}

function read_local_storage(key){
    return JSON.parse(localStorage.getItem(key));
}

function write_local_storage(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}

function delete_local_storage(key){
    localStorage.removeItem(key);
}

$('#bulk_save').submit(function (e){
    e.preventDefault();
    beacons = read_local_storage('beacons');
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: "/app/bulk_create_beacons/",
        type: "POST",
        headers: {
        'Content-Type':'application/json',
        'X-CSRFToken': csrftoken
        },
        dataType: "json",
        data: JSON.stringify({
            "beacons": beacons
        }),
        success: function(resp) {
            console.log(resp);
            $("#result").text(resp.status);
            delete_local_storage('beacons');
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
});

function load_ls_beacons(){
    beacons = read_local_storage('beacons');
    load_markers(beacons);
}

function load_markers(beacons){
    var markers = $("#markers");
    var marker = $(".marker");
    if(beacons){
        for(i=0; i<beacons.length; ++i){
            new_marker = marker.clone();
            new_marker.attr("class", "frozen_marker");
            new_marker.attr(
            "style", "position: absolute; left: "+beacons[i].x_position+"px; top:" + beacons[i].y_position +"px"
            );
            markers.append(new_marker);
        }
    }
}

function load_db_beacons(){
    $.ajax({
        url: "/app/get_beacons/",
        type: "GET",
        dataType: "json",
        success: function(resp) {
            console.log(resp);
            load_markers(resp);
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
}

function add_beacon_marker() {
    $("#beacon_id").val('');
    $("#beacon_name").val('');

    frozen_markers.push($('.marker'));
    new_marker = $(".marker").clone();
    $('.marker').attr("class", "frozen_marker");
    $('.marker').attr("src", "/static/main/frozen-marker-icon.png")
    $("#markers").append(new_marker);
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
