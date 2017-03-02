var frozen_markers = [];
var current_marker;
var map = $("#map");

$(document).ready(function() {
    var dialog;

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
        $("#x_position").val(e.pageX);
        $("#y_position").val(e.pageY);
        dialog.dialog("open");
    });
});


function addBeacon() {
    var csrftoken = getCookie('csrftoken');

    add_to_local_storage({
        "beacon_id": $("#beacon_id").val(),
        "beacon_name": $("#beacon_name").val(),
        "x_position": $("#x_position").val(),
        "y_position": $("#y_position").val()
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

function bulk_create_beacons(){
    beacons = read_local_storage('beacons');
    $.ajax({
        url: "/app/bulk_create_beacons/",
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrftoken,
            "beacons": beacons
        },
        success: function(resp) {
            console.log(resp);
            delete_local_storage('beacons');
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
}

function load_ls_beacons(){
    beacons = read_local_storage('beacons');
    var markers = $("#markers");

//    $.each(beacons, )
    new_marker = $(".marker").clone();
    $("#markers").append(new_marker);
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
