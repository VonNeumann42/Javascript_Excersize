
// Enum Declarations

const tile_types = {
    "Grass": {
        "id":0,
        "move_cost":{
            "foot":1,
            "mounted":1,
            "warmachine":2,
            "flying":1
        },
        "description": "Plain Grassland. Easy to cross for all land units, except siege machines."
    },
    "Water": {
        "id":1,
        "move_cost":{
            "foot":999,
            "mounted":999,
            "warmachine":999,
            "flying":1
        }
    },
    "Wasteland": {
        "id":2,
        "move_cost":{
            "foot":2,
            "mounted":3,
            "warmachine":3,
            "flying":1
        }
    }
};

const unit_types = {
    "Men_At_Arms" : {
        "id":0,
        "movement_speed":4,
        "motive_type":"foot",
        "min_attack_range":1,
        "max_attack_range":1,
        "can_counter":true,
        "combat_matrix": {
            "Men_At_Arms":45,
            "Spearmen":35,
            "Marksmen":55,
            "Outriders":35,
            "Camp":60,
            "Town":50
        },
        "capture": {
            "Camp":40,
            "Town":10
        },
        "description": "Conscripts from the general population armed with swords. Cheap, and relatively efficient infantry.",
        "special" : {
            
        }
    },
    "Spearmen" : {
        "id":1,
        "movement_speed":4,
        "motive_type":"foot",
        "min_attack_range":1,
        "max_attack_range":1,
        "can_counter":true,
        "combat_matrix": {
            "Men_At_Arms":30,
            "Spearmen":35,
            "Marksmen":45,
            "Outriders":45,
            "Camp":45,
            "Town":25
        },
        "capture": {
            "Camp":10
        },
        "description": "Conscripts from the general population armed with spears. Resilient, and reliable, but weak.",
        "special" : {
            
        }
    },
    "Marksmen" : {
        "id":2,
        "movement_speed":4,
        "motive_type":"foot",
        "min_attack_range":2,
        "max_attack_range":3,
        "can_counter":false,
        "combat_matrix": {
            "Men_At_Arms":55,
            "Spearmen":55,
            "Marksmen":55,
            "Outriders":45,
            "Camp":30,
            "Town":20
        },
        "capture": {
            "Camp":10
        },
        "description": "Trained hunters or soldiers, armed with a variety of ranged weapons. Powerful at range, but fragile in melee.",
        "special" : {
            
        }
    },
    "Outriders" : {
        "id":3,
        "movement_speed":6,
        "motive_type":"foot",
        "min_attack_range":1,
        "max_attack_range":1,
        "can_counter":true,
        "combat_matrix": {
            "Men_At_Arms":55,
            "Spearmen":35,
            "Marksmen":65,
            "Outriders":45,
            "Camp":65,
            "Town":30
        },
        "description": "Light and fast cavalry. Able to outmanouver most units and strike first.",
        "special" : {

        }
    },
    "Camp" : {
        "id":4,
        "movement_speed":0,
        "motive_type":"foot",
        "min_attack_range":1,
        "max_attack_range":1,
        "can_counter":true,
        "combat_matrix": {
            "Men_At_Arms":40,
            "Spearmen":40,
            "Outriders":30
        },
        "description": "A small camp. Some willing recruits might be found here.",
        "recruitment": {
            "Men_At_Arms": 30,
            "Spearmen": 40,
            "Marksmen": 80,
        },
        "special" : {
            "building":0,
            "regenerate":20
        }
    },
    "Town" : {
        "id":5,
        "movement_speed":0,
        "motive_type":"foot",
        "min_attack_range":1,
        "max_attack_range":1,
        "can_counter":true,
        "combat_matrix": {
            "Men_At_Arms":45,
            "Spearmen":45,
            "Outriders":35
        },
        "description": "A small town. There are enough people around to arm, and likely even some weapons for them.",
        "recruitment": {
            "Men_At_Arms": 10,
            "Spearmen": 10,
            "Marksmen": 30,
            "Outriders": 40
        },
        "special" : {
            "building":0,
            "regenerate":20
        }
    }
}

const game_mode = [
    "Map_Creation",
    "Play"
]

const unit_action_stage = [
    "None",
    "Movement",
    "Action",
    "ActionTarget"
]
    


// Class Declarations
class Tile {
    // Major variables
    tile_html;
    tile_visual;
    occupying_unit;
    current_traversal_value;
    arriving_traversal_value;
    has_potential_target = false;

    // Minor variables
    selector_rotation = 0;
    constructor(coordinate_x,coordinate_y){
        this.coordinate_x = coordinate_x;
        this.coordinate_y = coordinate_y;
        this.tile_type = "Grass"
    }

    initialize() {
        const x = this.coordinate_x
        const y = this.coordinate_y

        // Set tile type image
        this.tile_visual = document.createElement('img')
        this.tile_html.appendChild(this.tile_visual) 
        this.set_tile_visual()
        this.tile_visual.setAttribute("class","tile_background")

        // Set selection effect
        this.selection_effect = document.createElement('img')
        this.tile_html.appendChild(this.selection_effect)
        this.selection_effect.setAttribute("src","Images/Indicator.png")
        this.tile_visual.setAttribute("class","indicator")

        this.tile_html.addEventListener("mouseover", 
        function(){
            if(selected == [x,y]){return}
        });

        this.tile_html.addEventListener("mouseout", 
        function(){
            if(selected == [x,y]){return}
        });

        this.tile_html.addEventListener("click", 
        function(){
            tile_clicked(x,y)
        });
        
    }

    set_tile_visual(){
        this.tile_visual.setAttribute("src","Images/Tile_" + this.tile_type + ".png");
    }

    animate_selector(end = false){
        if (end){
            this.selector_rotation = 0;
            this.selection_effect.style.setProperty("rotate",this.selector_rotation + "deg");
            return
        }
        this.selector_rotation ++;
        this.selector_rotation %= 90;
        this.selection_effect.style.setProperty("rotate",this.selector_rotation + "deg");
    }

    traverse(motive_type, initial_tile = false){
        
        let cost = tile_types[this.tile_type]["move_cost"][motive_type];
        let new_remaining_movement = this.arriving_traversal_value - cost;

        if (this.current_traversal_value >= new_remaining_movement){
            return
        }

        this.current_traversal_value = new_remaining_movement;
        if(initial_tile){
            this.current_traversal_value = this.arriving_traversal_value
            new_remaining_movement = this.arriving_traversal_value
        }

        if(this.occupying_unit != null){
            this.current_traversal_value = -1;
            if(this.occupying_unit.owner != selected_unit.owner){
                return;
            }
        }

        // cascade
        if(this.coordinate_x != 0){
            tile_grid[this.coordinate_x-1][this.coordinate_y].arrive(new_remaining_movement)
        }
        if(this.coordinate_x != (tile_grid.length -1)){
            tile_grid[this.coordinate_x+1][this.coordinate_y].arrive(new_remaining_movement)
        }
        if(this.coordinate_y != 0){
            tile_grid[this.coordinate_x][this.coordinate_y-1].arrive(new_remaining_movement)
        }
        if(this.coordinate_y != (tile_grid[0].length -1)){
            tile_grid[this.coordinate_x][this.coordinate_y+1].arrive(new_remaining_movement)
        }
    }

    remove(){
        this.tile_html.remove()
    }
    
    arrive(remaining_movement){
        if(remaining_movement > this.arriving_traversal_value){
            movement_queue.push(tile_grid[this.coordinate_x][this.coordinate_y]);
            this.arriving_traversal_value = remaining_movement;
        }
    }


}

class Unit {
    position;
    unit_visual;
    unit_html;
    owner;
    constructor(){
        this.health = 100
        this.action_ready = true
        this.unit_type = "Men_At_Arms"
    }

    initialize(){
        const x = this.position[0]
        const y = this.position[1]

        tile_grid[x][y].occupying_unit = this

        this.unit_html = document.createElement('div');
        this.unit_html.setAttribute("class", "unit");
        tile_grid[x][y].tile_html.appendChild(this.unit_html)

        // image
        this.unit_visual = document.createElement('img')
        this.unit_html.appendChild(this.unit_visual) 
        this.set_unit_visual()
        this.unit_visual.setAttribute("class","unit_visual")

        // health indicator
        this.unit_health_indicator = document.createElement('div')
        this.unit_html.appendChild(this.unit_health_indicator)
        this.unit_health_indicator.setAttribute("class","unit_hp")
        this.set_health_indicator()

        // owner indicator
        this.unit_owner_indicator = document.createElement('div')
        this.unit_html.appendChild(this.unit_owner_indicator)
        this.unit_owner_indicator.setAttribute("class","unit_owner_indicator")
        this.set_owner()

        this.set_action_status(false)
    }

    set_unit_visual(){
        this.unit_visual.setAttribute("src","Images/Unit_" + this.unit_type + ".png")
    }

    die(cause){
        if("building" in unit_types[this.unit_type].special && cause == "combat"){
            this.owner = -1;
            this.health = 100;
            this.set_health_indicator();
            this.set_owner();
            return;
        }
        this.unit_html.remove()
        tile_grid[this.position[0]][this.position[1]].occupying_unit = null;
        const index = unit_list.indexOf(this);
        unit_list.splice(index,1);
    }

    set_action_status(ready){
        this.action_ready = ready
        if(ready){
            this.unit_visual.setAttribute("class","unit_visual");
        } else {
            this.unit_visual.setAttribute("class","exhausted_unit_visual");
        }
        
    }

    set_health_indicator(){
        let health_indicated = this.health / 10
        health_indicated -= health_indicated % 1
        if (health_indicated == 0){
            health_indicated ++;
        }
        if (health_indicated == 10){
            this.unit_health_indicator.innerText = ""
            return
        }
        this.unit_health_indicator.innerText = "" + health_indicated
    }

    set_owner(){
        if(this.owner == -1){
            this.unit_owner_indicator.style.setProperty("background-color","#cccccc");
            return
        }
        this.unit_owner_indicator.style.setProperty("background-color",players[this.owner]);
    }
}

// Const Declarations

const framerate = 60
const base_game_state = '{"map_size":[10,14],"map":[[1,1,1,1,0,0,0,0,0,0,1,1,1,1],[1,1,0,0,0,1,1,0,0,0,0,0,1,1],[1,0,0,0,2,1,1,1,0,0,0,0,0,1],[1,0,0,2,2,0,1,0,0,0,0,0,0,1],[0,0,2,2,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,2,2,0,0],[1,0,0,0,0,0,0,1,0,2,2,0,0,1],[1,0,0,0,0,0,1,1,1,2,0,0,0,1],[1,1,0,0,0,0,0,1,1,0,0,0,1,1],[1,1,1,1,0,0,0,0,0,0,1,1,1,1]],"units":[{"type":"Town","position":[7,2],"owner":0,"health":100},{"type":"Town","position":[2,11],"owner":1,"health":100},{"type":"Camp","position":[8,11],"owner":1,"health":100},{"type":"Camp","position":[7,11],"owner":1,"health":100},{"type":"Camp","position":[1,2],"owner":0,"health":100},{"type":"Camp","position":[2,2],"owner":0,"health":100},{"type":"Camp","position":[6,6],"owner":-1,"health":100},{"type":"Camp","position":[3,7],"owner":-1,"health":100}]}'


// Html Elements
const field_html = document.getElementById("field");
const turn_indicator_html = document.getElementById("turn_indicator_text");
const end_turn_button = document.getElementById("end_turn_button");
const save_button = document.getElementById("save_button");
const load_button = document.getElementById("load_button");
const load_input = document.getElementById("load_input");

const map_editor_finish_button = document.getElementById("resume_play_button");
const map_editor_tile_dropdown = document.getElementById("editor_tile_options");
const map_editor_unit_dropdown = document.getElementById("editor_unit_options");
const map_editor_owner_dropdown = document.getElementById("editor_owner_options");
const map_editor_health_input = document.getElementById("editor_health_input")


const tile_description_html = {
    "type": document.getElementById("tile_name"),
    "description_text": document.getElementById("tile_description_text"),
    "movement_foot": document.getElementById("tile_movement_foot"),
    "movement_mounted": document.getElementById("tile_movement_mounted"),
    "movement_warmachine": document.getElementById("tile_movement_warmachine"),
    "movement_flying": document.getElementById("tile_movement_flying")
}

const unit_description_html = {
    "type": document.getElementById("unit_name"),
    "description_text": document.getElementById("unit_description_text"),
    "motive_type": document.getElementById("unit_motive_type"),
    "health": document.getElementById("unit_health"),
    "owner": document.getElementById("unit_owner"),
    "speed": document.getElementById("unit_speed"),
    "range": document.getElementById("unit_range")
}

const unit_action_menu = document.getElementById("action_menu")
const unit_action_wait = document.getElementById("unit_action_wait")
const unit_action_attack = document.getElementById("unit_action_attack")
const unit_action_cancel = document.getElementById("unit_action_cancel")
const unit_action_capture = document.getElementById("unit_action_capture")

const sub_menu_array = [
    document.getElementById("info_area"),
    document.getElementById("editor_area"),
    document.getElementById("tutorial_area")
]

let players = [
    "#cc3333",
    "#3333cc"
]

// Variable Declarations

// Variables for tracking the game state
let current_action_state = "Play_Select_Unit"
let current_turn = 0
let current_player = 1

// Variables for tracking objecs
let tile_grid = []
let unit_list = []
let available_unit_actions = {}

// Variables for resolving active actions
let new_selected = [-1,-1]
let new_selected_unit = null;
let new_selected_tile = null;
let selected = [-1,-1]
let selected_unit = null;
set_unit_description()
let selected_tile = null;
set_tile_description()
let command_value = null;

let movement_queue = []

// Variables for map editing
let edit_id = [0,0,100];



// Main

end_turn_button.addEventListener("click",end_turn);
save_button.addEventListener("click",save_to_clipboard);
load_button.addEventListener("click",load_from_clipboard);
map_editor_finish_button.addEventListener("click",function(){set_map_editor_function("not_editing",0)})

document.getElementById("sub_menu_info").addEventListener("click",function(){set_sub_menu(0)})
document.getElementById("sub_menu_edit").addEventListener("click",function(){set_sub_menu(1)})
document.getElementById("sub_menu_explanation").addEventListener("click",function(){set_sub_menu(2)})
set_sub_menu(0)

set_up_map_editor()
set_up_action_menu()
create_grid(10,14)

load_game(base_game_state);

end_turn()


setTimeout(update,Math.floor(1000/framerate))

function update(){
    setTimeout(update,Math.floor(1000/framerate));

    // animate selected tile:
    if(selected_tile != null){
        selected_tile.animate_selector()
    }
}

// Functions

function create_grid(dimension_x, dimension_y){
    
    field_html.style.setProperty("width", dimension_x * 50 + "px")
    field_html.style.setProperty("height", dimension_y * 50 + "px")
    for(let i = 0; i < dimension_x; i++){
        tile_grid.push([])
        for(let j = 0; j < dimension_y; j++){

            const tile_html = document.createElement('div');
            tile_html.setAttribute("class", "game_tile");
            field_html.appendChild(tile_html) 
            tile_html.style.setProperty("top", (j * 50) + "px");
            tile_html.style.setProperty("left", (i * 50) + "px");
            
            let new_tile = new Tile(i,j)
            new_tile.tile_html = tile_html

            tile_grid[i].push(new_tile)
            new_tile.initialize()
        }
    }
}

function deselect(){
    if(selected_tile != null){
        selected_tile.animate_selector(true);
    }
    
    selected = [-1,-1];
    selected_tile = null;
    set_tile_description()
    selected_unit = null;
    set_unit_description()

    reset_pathing_map();
    let current_action_state = "Play_Select_Unit"
    unit_action_menu.style.setProperty("display","none")
    command_value = null;
}

function end_turn(){

    deselect()

    for(let i = 0; i < unit_list.length; i++){
        unit_list[i].set_action_status(true)
    }

    current_player ++;
    current_player %= players.length;
    if (current_player == 0){
        current_turn ++;
    }
    turn_indicator_html.innerText = "Turn: " + current_turn;
    turn_indicator_html.style.setProperty("text-shadow","1px 1px 5px " + players[current_player]);
    start_turn_effects();
}

function start_turn_effects(){
    unit_list.forEach(current_unit => {
        if(current_unit.owner == current_player && "regenerate" in unit_types[current_unit.unit_type]["special"]){
            current_unit.health = Math.min(100,current_unit.health + unit_types[current_unit.unit_type]["special"]["regenerate"]);
            current_unit.set_health_indicator();
        }
    });
}

function reset_pathing_map(){
    for(let i = 0; i < tile_grid.length; i++){
        for(let j = 0; j < tile_grid[i].length; j++){
            tile_grid[i][j].arriving_traversal_value = -1;
            tile_grid[i][j].current_traversal_value = -1;
            tile_grid[i][j].selection_effect.style.setProperty("rotate","0deg");
            tile_grid[i][j].has_potential_target = false;
        }
    }
}

function create_pathing_map(maximum_range, motive_type){
    selected_tile.arrive(maximum_range)
    selected_tile.traverse(motive_type,true)
    while(movement_queue.length > 0){
        let current_tile = movement_queue.pop()
        current_tile.traverse(motive_type)
    }

    for(let i = 0; i < tile_grid.length; i++){
        for(let j = 0; j < tile_grid[0].length; j++){
            if(tile_grid[i][j].current_traversal_value >= 0){
                tile_grid[i][j].selection_effect.style.setProperty("rotate","45deg");
            }
        }
    }
}

function create_attack_map(unit, origin = null){
    
    if (origin == null) {
        origin = unit.position
    }

    const max_attack_range = unit_types[unit.unit_type]["max_attack_range"]
    const min_attack_range = unit_types[unit.unit_type]["min_attack_range"]
    let potential_targets = false
    let i_min = Math.max(0, origin[0] - max_attack_range)
    let i_max = Math.min(tile_grid.length - 1, origin[0] + max_attack_range)

    let j_min = Math.max(0, origin[1] - max_attack_range)
    let j_max = Math.min(tile_grid[0].length - 1, origin[1] + max_attack_range)
    for(let i = i_min; i <= i_max; i++){
        for(let j = j_min; j <= j_max; j++){
            let distance = Math.abs(j-origin[1]) + Math.abs(i-origin[0])
            if(distance <= max_attack_range && distance >= min_attack_range){
                const potential_target_unit = tile_grid[i][j].occupying_unit
                if(potential_target_unit != null){
                    if(potential_target_unit.owner != unit.owner && potential_target_unit.owner >= 0 && unit_types[unit.unit_type]["combat_matrix"].hasOwnProperty(potential_target_unit.unit_type)){
                        potential_targets = true;
                        tile_grid[i][j].selection_effect.style.setProperty("rotate","45deg");
                        tile_grid[i][j].has_potential_target = true;
                    }
                }
            }
        }
    }
    return potential_targets
}

// Action Functions

function tile_clicked(coord_x,coord_y){
    new_selected = [coord_x,coord_y]
    new_selected_tile = tile_grid[coord_x][coord_y]
    new_selected_unit = new_selected_tile.occupying_unit

    switch (current_action_state) {
        case "Edit_Tile":
            edit_tile()
            return;
        case "Edit_Unit":
            edit_unit()
            return;
    
        default:
            break;
    }

    if (new_selected_tile == selected_tile && selected_unit == null){
        deselect()
        return
    }
    

    if(selected_unit != null)
        unit_action()
    else
        tile_action()
}

function unit_action(){
    switch (current_action_state) {
        case "Play_Unit_Action_Movement":
            action_unit_movement();
            break;
        case "Play_Unit_Action_Combat":
            action_unit_combat();
            break;
        case "Play_Unit_Recruitment":
            action_recruitment();
            break;
        case "Play_Unit_Capture":
            action_unit_capture();
            break;
        default:
            console.error("Unit action hit default clause")
            break;
    }
}

function set_unit_action_menu(){
    unit_action_menu.style.setProperty("display","grid");
    unit_action_menu.style.setProperty("top", (new_selected[1] * 50) + "px");
    unit_action_menu.style.setProperty("left", ((new_selected[0] + 1) * 50) + "px");

    for(action in available_unit_actions){
        available_unit_actions[action].style.setProperty("display","none");
    }
    available_unit_actions["wait"].style.setProperty("display","grid");
    available_unit_actions["cancel"].style.setProperty("display","grid");

    if(create_attack_map(selected_unit,[new_selected_tile.coordinate_x,new_selected_tile.coordinate_y])){
        available_unit_actions["attack"].style.setProperty("display","grid");
    }

    let adjacent = []
    if(tile_grid.length > new_selected[0] + 1){
        adjacent.push(tile_grid[new_selected[0]+1][new_selected[1]])
    }
    if(tile_grid[0].length > new_selected[1] + 1){
        adjacent.push(tile_grid[new_selected[0]][new_selected[1]+1])
    }
    if(new_selected[0] - 1 >= 0){
        adjacent.push(tile_grid[new_selected[0]-1][new_selected[1]])
    }
    if(new_selected[1] - 1 >= 0){
        adjacent.push(tile_grid[new_selected[0]][new_selected[1]-1])
    }

    if("recruitment" in unit_types[selected_unit.unit_type]){
        for(recruitment_option in unit_types[selected_unit.unit_type]["recruitment"]){
            // Check if recruitment is possible to at least one tile
            let recruitment_option_motive_type = unit_types[recruitment_option]["motive_type"];
            for(adjacent_tile of adjacent){
                if(tile_types[adjacent_tile.tile_type]["move_cost"][recruitment_option_motive_type] < 99 && adjacent_tile.occupying_unit == null){
                    available_unit_actions[recruitment_option].style.setProperty("display","grid");
                    break;
                }
            }
            
        }
    }

    if("capture" in unit_types[selected_unit.unit_type]){
        for(adjacent_tile of adjacent){
            if(adjacent_tile.occupying_unit != null){
                if(adjacent_tile.occupying_unit.owner == -1 && adjacent_tile.occupying_unit.unit_type in unit_types[selected_unit.unit_type]["capture"]){
                    available_unit_actions["capture"].style.setProperty("display","grid");
                    break;
                }
            }
        }
    }
    
}

function action_unit_combat(){
    if(new_selected_tile.has_potential_target){
        calculate_unit_combat()
    }
    deselect()
}


function action_unit_movement(){
    if(new_selected_tile.current_traversal_value >= 0){
        new_selected_tile.occupying_unit = selected_unit
        selected_tile.occupying_unit = null
        selected_unit.position = new_selected
        new_selected_tile.tile_html.appendChild(selected_unit.unit_html)

        selected_unit.set_action_status(false)

        reset_pathing_map()
        set_unit_action_menu()
    }
}

function action_recruitment(){
    if(!new_selected_tile.has_potential_target){
        return;
    }
    let created_unit = new Unit()
    created_unit.position = new_selected;
    created_unit.owner = selected_unit.owner;
    created_unit.health = selected_unit.health;

    created_unit.unit_type = command_value;
    

    unit_list.push(created_unit)
    created_unit.initialize()

    selected_unit.health -= unit_types[selected_unit.unit_type]["recruitment"][command_value]
    selected_unit.set_health_indicator()

    deselect();

    
}

function action_unit_recruitment_check(recruited_unit_type){
    reset_pathing_map()
    let recruitment_option_motive_type = unit_types[recruited_unit_type]["motive_type"]
    let adjacent = []
    if(tile_grid.length > selected[0] + 1){
        adjacent.push(tile_grid[selected[0]+1][selected[1]])
    }
    if(tile_grid[0].length > selected[1] + 1){
        adjacent.push(tile_grid[selected[0]][selected[1]+1])
    }
    if(selected[0] - 1 >= 0){
        adjacent.push(tile_grid[selected[0]-1][selected[1]])
    }
    if(selected[1] - 1 >= 0){
        adjacent.push(tile_grid[selected[0]][selected[1]-1])
    }

    for(adjacent_tile of adjacent){
        if(tile_types[adjacent_tile.tile_type]["move_cost"][recruitment_option_motive_type] < 99 && adjacent_tile.occupying_unit == null){
            adjacent_tile.selection_effect.style.setProperty("rotate","45deg");
            adjacent_tile.has_potential_target = true;
        }
    }

    command_value = recruited_unit_type;
    current_action_state = "Play_Unit_Recruitment";
    unit_action_menu.style.setProperty("display","none");
}


function action_unit_capture_check(){
    reset_pathing_map();
    let adjacent = []
    if(tile_grid.length > new_selected[0] + 1){
        adjacent.push(tile_grid[new_selected[0]+1][new_selected[1]])
    }
    if(tile_grid[0].length > new_selected[1] + 1){
        adjacent.push(tile_grid[new_selected[0]][new_selected[1]+1])
    }
    if(new_selected[0] - 1 >= 0){
        adjacent.push(tile_grid[new_selected[0]-1][new_selected[1]])
    }
    if(new_selected[1] - 1 >= 0){
        adjacent.push(tile_grid[new_selected[0]][new_selected[1]-1])
    }

    for(adjacent_tile of adjacent){
        if(adjacent_tile.occupying_unit != null){
            if(adjacent_tile.occupying_unit.owner == -1 && adjacent_tile.occupying_unit.unit_type in unit_types[selected_unit.unit_type]["capture"]){
                adjacent_tile.selection_effect.style.setProperty("rotate","45deg");
                adjacent_tile.has_potential_target = true;
            }
        }
    }

    current_action_state = "Play_Unit_Capture";
    unit_action_menu.style.setProperty("display","none");
}

function action_unit_capture(){
    if(!new_selected_tile.has_potential_target){
        return;
    }
    new_selected_unit.owner = selected_unit.owner;
    new_selected_unit.health = Math.round(unit_types[selected_unit.unit_type]["capture"][new_selected_unit.unit_type] * selected_unit.health / 100);
    selected_unit.die("capture");
    deselect();
}


function cancel_movement(){
    selected_tile.occupying_unit = selected_unit
    new_selected_tile.occupying_unit = null
    selected_unit.position = selected
    selected_tile.tile_html.appendChild(selected_unit.unit_html)

    selected_unit.set_action_status(true)
    deselect()
}

function tile_action(){
    if(new_selected_unit != null){
    // Select unit
        
        // check if the unit is action ready:
        if(new_selected_unit.action_ready && new_selected_unit.owner == current_player){
            select_unit()
            return
        }
    } 
    select_tile()
}

function select_unit(){
    selected = new_selected;
    selected_unit = new_selected_unit;
    set_unit_description();
    selected_tile = new_selected_tile;
    set_tile_description();

    // For immobile units skip movement and go straight to the action menu
    if(unit_types[selected_unit.unit_type]["movement_speed"] <= 0){
        selected_unit.set_action_status(false)
        set_unit_action_menu();
        return
    }
    
    // create a pathing map
    reset_pathing_map()
    let maximum_range = unit_types[selected_unit.unit_type]["movement_speed"]
    let motive_type = unit_types[selected_unit.unit_type]["motive_type"]

    create_pathing_map(maximum_range,motive_type)
    current_action_state = "Play_Unit_Action_Movement"
}

function select_tile(){

    deselect()
    selected = new_selected
    selected_tile = new_selected_tile
    set_tile_description()
}

// Editor functions

function set_up_map_editor(){
    let i = 0;
    for(tile_option in tile_types){
        const tile_type_id = i;
        let tile_option_html = document.createElement('button');
        map_editor_tile_dropdown.appendChild(tile_option_html);
        tile_option_html.innerText += tile_option;
        tile_option_html.setAttribute("class","dropdown_element")

        let tile_option_image = document.createElement('img');
        tile_option_html.appendChild(tile_option_image);
        tile_option_image.setAttribute('src',"Images/Tile_" + tile_option + ".png");
        
        tile_option_html.addEventListener("click", 
        function(){
            set_map_editor_function("Edit_Tile",[tile_type_id,null,null])
        });
        i++;
    }

    i= 0;
    for(unit_option in unit_types){
        const unit_type_id = i;
        let unit_option_html = document.createElement('button');
        map_editor_unit_dropdown.appendChild(unit_option_html);
        unit_option_html.innerText += unit_option;
        unit_option_html.setAttribute("class","dropdown_element")

        let unit_option_image = document.createElement('img');
        unit_option_html.appendChild(unit_option_image);
        unit_option_image.setAttribute('src',"Images/Unit_" + unit_option + ".png");
        
        unit_option_html.addEventListener("click", 
        function(){
            set_map_editor_function("Edit_Unit",[unit_type_id,null,null])
        });
        i++;
    }


    const neutral_id = -1;
    let owner_option_neutral_html = document.createElement('button');
    map_editor_owner_dropdown.appendChild(owner_option_neutral_html);
    owner_option_neutral_html.innerText += "Neutral";
    owner_option_neutral_html.setAttribute("class","dropdown_element");
    owner_option_neutral_html.style.setProperty("background_color","#cccccc");
    
    owner_option_neutral_html.addEventListener("click", 
    function(){
        set_map_editor_function(null,[null,neutral_id,null])
    });

    i= 0;
    for(player in players){
        const player_id = i;
        let owner_option_html = document.createElement('button');
        map_editor_owner_dropdown.appendChild(owner_option_html);
        owner_option_html.innerText += "Player " + (player_id+1);
        owner_option_html.setAttribute("class","dropdown_element");
        owner_option_html.style.setProperty("background_color",player);
        
        owner_option_html.addEventListener("click", 
        function(){
            set_map_editor_function(null,[null,player_id,null])
        });
        i++;
    }

    map_editor_health_input.value = edit_id[2];
    map_editor_health_input.addEventListener("input", 
    function(){
        let input_value = map_editor_health_input.value;
        input_value = Math.round(input_value)
        input_value = Math.max(Math.min(input_value, 100), 0)
        set_map_editor_function(null,[null,null,input_value])
        map_editor_health_input.value = edit_id[2]
    });

}

function set_map_editor_function(new_edit_type, new_edit_id){
    if(new_edit_type != null){
        current_action_state = new_edit_type;
    }
    if(new_edit_id[0] != null){
        edit_id[0] = new_edit_id[0];
    }
    if(new_edit_id[1] != null){
        edit_id[1] = new_edit_id[1];
    }
    if(new_edit_id[2] != null){
        edit_id[2] = new_edit_id[2];
    }
    
}

function edit_tile(){
    type_array = Object.keys(tile_types);
    new_selected_tile.tile_type = type_array[edit_id[0]];
    new_selected_tile.set_tile_visual();
    deselect();
}

function edit_unit(){
    if(new_selected_unit != null){
        new_selected_unit.die("edit");
        new_selected_unit = null;
    }
    if(edit_id[2] == 0){
        return;
    }

    let created_unit = new Unit()
    created_unit.position = new_selected;
    created_unit.owner = edit_id[1];
    created_unit.health = edit_id[2];

    type_array = Object.keys(unit_types);
    created_unit.unit_type = type_array[edit_id[0]];

    unit_list.push(created_unit)
    created_unit.initialize()
    
    deselect();
}

function set_up_action_menu(){
    unit_action_menu.style.setProperty("display","none");
    unit_action_attack.addEventListener("click",function(){
        current_action_state = "Play_Unit_Action_Combat";
        unit_action_menu.style.setProperty("display","none");
    });
    unit_action_wait.addEventListener("click",function(){
        deselect();
    });
    unit_action_cancel.addEventListener("click",function(){
        cancel_movement();
    });
    unit_action_capture.addEventListener("click",function(){
        action_unit_capture_check();
    });
    available_unit_actions["cancel"] = unit_action_cancel;
    available_unit_actions["wait"] = unit_action_wait;
    available_unit_actions["attack"] = unit_action_attack;
    available_unit_actions["capture"] = unit_action_capture;

    for(recruitable in unit_types){
        const recruit_action = document.createElement('button');
        const recruitable_unit_type = recruitable;
        unit_action_menu.appendChild(recruit_action);
        recruit_action.innerText = "recruit " + recruitable;
        available_unit_actions[recruitable] = recruit_action;
        
        recruit_action.setAttribute("class","dropdown_element")
        recruit_action.addEventListener("click", function(){
            action_unit_recruitment_check(recruitable_unit_type);
        })
    }
}

// Ability and combat functions

function calculate_unit_combat(){
    if(!new_selected_tile.has_potential_target){
        return
    }

    let attacking_unit = selected_unit
    let defending_unit = new_selected_unit

    let attack_power = unit_types[attacking_unit.unit_type]["combat_matrix"][defending_unit.unit_type]
    let luck_roll = Math.floor(Math.random() * 10)
    attack_power = Math.floor((attack_power + luck_roll) / 100 * attacking_unit.health)

    // apply damage
    defending_unit.health -= attack_power
    console.log("combat damage dealt: " + attack_power)
    if(defending_unit.health <= 0){
        defending_unit.die("combat")
    } else {
        defending_unit.set_health_indicator()

        // Attempt a counter attack
        const distance = Math.abs(attacking_unit.position[0] - defending_unit.position[0]) + Math.abs(attacking_unit.position[1] - defending_unit.position[1])
        if(unit_types[defending_unit.unit_type]["combat_matrix"].hasOwnProperty(attacking_unit.unit_type) && distance == 1 && unit_types[defending_unit.unit_type]["can_counter"]){
            attack_power = unit_types[defending_unit.unit_type]["combat_matrix"][attacking_unit.unit_type]
            luck_roll = Math.floor(Math.random() * 10)
            attack_power = Math.floor((attack_power + luck_roll) / 100 * defending_unit.health)
            attacking_unit.health -= attack_power
            console.log("retaliation damage dealt: " + attack_power)
            if(attacking_unit.health <= 0){
                attacking_unit.die("combat");
            } else {
                attacking_unit.set_health_indicator()
            }
            
        }
    }
}

// Descriptor functions

function set_tile_description(){
    if(selected_tile == null){
        tile_description_html["type"].innerText = "-";
        tile_description_html["description_text"].innerText = "select a tile for more information";
        tile_description_html["movement_foot"].innerText = "Foot:" + "-"
        tile_description_html["movement_mounted"].innerText = "Mounted:" + "-"
        tile_description_html["movement_warmachine"].innerText = "Warmachine:" + "-"
        tile_description_html["movement_flying"].innerText = "Flying:" + "-"
        return;
    }
    const selected_tile_type = selected_tile.tile_type
    tile_description_html["type"].innerText = selected_tile_type
    tile_description_html["description_text"].innerText = tile_types[selected_tile_type]["description"]

    tile_description_html["movement_foot"].innerText = "Foot:" + tile_types[selected_tile_type]["move_cost"]["foot"]
    tile_description_html["movement_mounted"].innerText = "Mounted:" + tile_types[selected_tile_type]["move_cost"]["mounted"]
    tile_description_html["movement_warmachine"].innerText = "Warmachine:" + tile_types[selected_tile_type]["move_cost"]["warmachine"]
    tile_description_html["movement_flying"].innerText = "Flying:" + tile_types[selected_tile_type]["move_cost"]["flying"]

}

function set_unit_description(){
    if(selected_unit == null){
        unit_description_html["type"].innerText = "-";
        unit_description_html["description_text"].innerText = "select a unit for more information";
        unit_description_html["motive_type"].innerText = "Movement:" + "-"
        unit_description_html["health"].innerText = "Health:" + "-"
        unit_description_html["owner"].innerText = "Player:" + "-"
        unit_description_html["owner"].style.setProperty("color","black");
        unit_description_html["speed"].innerText = "Speed:" + "-"
        unit_description_html["range"].innerText = "Range:" + "-"
        return;
    }
    const selected_unit_type = selected_unit.unit_type
    unit_description_html["type"].innerText = selected_unit_type;
    unit_description_html["description_text"].innerText = unit_types[selected_unit_type]["description"];
    unit_description_html["motive_type"].innerText = "Movement:" + unit_types[selected_unit_type]["motive_type"]
    unit_description_html["health"].innerText = "Health:" + selected_unit.health
    unit_description_html["owner"].innerText = "Player:" + (selected_unit.owner + 1)
    unit_description_html["owner"].style.setProperty("color",players[selected_unit.owner]);
    unit_description_html["speed"].innerText = "Speed:" + unit_types[selected_unit_type]["movement_speed"];
    unit_description_html["range"].innerText = "Range:" + unit_types[selected_unit_type]["min_attack_range"] + "-" + unit_types[selected_unit_type]["max_attack_range"];
}

// Data persistance functions

function generate_save_string(){
    let save_object = {};
    save_object["map_size"] = [tile_grid.length,tile_grid[0].length];
    let save_map = [];
    for(let i = 0; i < save_object["map_size"][0]; i++){
        save_map.push([]);
        for(let j = 0; j < save_object["map_size"][1]; j++){
            save_map[i].push(tile_types[tile_grid[i][j].tile_type]["id"]);
        }
    }
    save_object["map"] = save_map;
    let save_units = [];
    for(const save_unit of unit_list) {
        let unit_save_data = {}
        unit_save_data["type"] = save_unit.unit_type;
        unit_save_data["position"] = save_unit.position;
        unit_save_data["owner"] = save_unit.owner;
        unit_save_data["health"] = save_unit.health;
        save_units.push(unit_save_data);
    }
    save_object["units"] = save_units;
    return JSON.stringify(save_object);
}

function save_to_clipboard(){
    save_string = generate_save_string();
    navigator.clipboard.writeText(save_string);
}

function load_from_clipboard(){
    save_string = load_input.value;
    load_game(save_string)
}

function load_game(save_string){

    // delete previous data
    for(let i = 0; i < tile_grid.length; i++){
        for(let j = 0; j < tile_grid[i].length; j++){
            tile_grid[i][j].remove()
        }
    }
    tile_grid = [];
    unit_list = [];

    // load new data
    const loaded_data = JSON.parse(save_string);

    const loaded_map_size = loaded_data["map_size"];
    const loaded_map_data = loaded_data["map"];
    const loaded_unit_data = loaded_data["units"];

    // apply loaded data
    create_grid(loaded_map_size[0],loaded_map_size[1])
    type_array = Object.keys(tile_types)

    for(let i = 0; i < loaded_map_data.length; i++){
        for(let j = 0; j < loaded_map_data[i].length; j++){
            tile_grid[i][j].tile_type = type_array[loaded_map_data[i][j]];
            tile_grid[i][j].set_tile_visual();
        }
    }
    
    loaded_unit_data.forEach(loaded_unit => {
        const loaded_unit_instance = new Unit();
        loaded_unit_instance.unit_type = loaded_unit["type"];
        loaded_unit_instance.position = loaded_unit["position"];
        loaded_unit_instance.owner = loaded_unit["owner"];
        loaded_unit_instance.health = loaded_unit["health"];
        unit_list.push(loaded_unit_instance);
        loaded_unit_instance.initialize();
    });
}

function set_sub_menu(sub_menu_id){
    for(let i = 0; i < sub_menu_array.length; i++){
        sub_menu_array[i].style.setProperty("display","none");
        if(i == sub_menu_id){
            sub_menu_array[i].style.setProperty("display","grid");
        }
    }
}