import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SaveResultsButton from '@/components/SaveResultsButton';
import SavedResultsSidebar from '@/components/tools/SavedResultsSidebar';
import VolumeSummaryCards from './volume-calculator/VolumeSummaryCards';
import RoomNavigationTabs from './volume-calculator/RoomNavigationTabs';
import PresetItemsList from './volume-calculator/PresetItemsList';
import ItemDropdown from './volume-calculator/ItemDropdown';
import RoomItemsList from './volume-calculator/RoomItemsList';
import RoomNavigationButtons from './volume-calculator/RoomNavigationButtons';
import CustomItemForm from './volume-calculator/CustomItemForm';
import UnassignedItemsList from './volume-calculator/UnassignedItemsList';
import RoomSelectionModal from './volume-calculator/RoomSelectionModal';
import TruckRecommendations from './volume-calculator/TruckRecommendations';


interface FurnitureItem {
    id: string;
    name: string;
    volume: number; // in cubic meters
    category: string;
    icon: string;
    image?: string;
}

interface Room {
    id: string;
    name: string;
    items: { [itemId: string]: number }; // itemId: quantity
    autoFragileBoxCount?: number; // Automatically calculated fragile boxes based on fragile items
    autoRegularBoxCount?: number; // Automatically calculated regular boxes based on boxable items
    selectedBoxSize?: BoxSize; // Box size selected for this room
}

interface TruckSize {
    name: string;
    volume: number;
    description: string;
    icon: string;
    price: string;
}

interface UnassignedItem {
    itemId: string;
    quantity: number;
}

interface RoomSelectionModal {
    isOpen: boolean;
    selectedItem: FurnitureItem | null;
}

interface BoxSize {
    name: string;
    volume: number; // in cubic meters
    description: string;
}

interface VolumeCalculatorProps {
    initialSavedResults?: any[];
}

export default function VolumeCalculator({ initialSavedResults }: VolumeCalculatorProps) {
    // Define preset items for each room type
    const presetRoomItems: { [roomName: string]: string[] } = {
        'Hallway': ['hall_table', 'small_table', 'mirror_small', 'picture_small', 'lamp_floor', 'stool'],
        'Lounge': ['sofa_3seater', 'armchair_medium', 'coffee_table', 'tv_flat_large', 'glass_cabinet', 'cabinet_small', 'rug_large', 'lamp_table', 'ornament'],
        'Kitchen': ['table_breakfast', 'dining_chair', 'fridge_freezer', 'washing_machine', 'microwave', 'kettle', 'toaster', 'wine_rack'],
        'Dining Room': ['dining_table_medium', 'dining_chair', 'sideboard_medium', 'china_cabinet', 'picture_large', 'vase'],
        'Bedroom 1': ['bed_divan_double', 'wardrobe_double', 'chest_drawers_med', 'bedside_cabinet', 'dressing_table', 'bedroom_chair', 'mirror_large', 'lamp_table'],
        'Loft': ['pack_2', 'pack_6', 'suitcases', 'trunk', 'archive_boxes', 'boxed_3cuft'],
        'Garden': ['garden_bench', 'garden_chair', 'garden_table', 'portable_bbq', 'mower_elec', 'parasol', 'garden_ornament'],
        'Garage': ['bicycle', 'child_bicycle', 'tool_case', 'ladder', 'workbench', 'pack_2']
    };

    // Define available box sizes
    const boxSizes: BoxSize[] = [
        { name: 'Medium', volume: 0.19, description: '45×35×30cm - Standard moving box' },
        { name: 'Large', volume: 0.35, description: '61×46×41cm - Large moving box' }
    ];

    // Comprehensive furniture database matching Mercia Movers survey items
    const furnitureDatabase: FurnitureItem[] = [
        // Living Room - Seating
        { id: 'armchair_small', name: 'Armchair Small', volume: 1.5, category: 'Living Room', icon: '🪑', image: '/images/tools-item/small_armchair.jpg' },
        { id: 'armchair_medium', name: 'Armchair Medium', volume: 1.8, category: 'Living Room', icon: '🪑', image: '/images/tools-item/medium_armchair.jpg' },
        { id: 'armchair_large', name: 'Armchair Large', volume: 2.2, category: 'Living Room', icon: '🪑', image: '/images/tools-item/large_armchair.jpg' },
        { id: 'armchair_recliner', name: 'Armchair Recliner', volume: 2.5, category: 'Living Room', icon: '🪑', image: '/images/tools-item/reclining_armchair.jpg' },
        { id: 'sofa_2seater', name: 'Sofa 2 Seater', volume: 2.5, category: 'Living Room', icon: '🛋️', image: '/images/tools-item/sofa_small.jpg' },
        { id: 'sofa_3seater', name: 'Sofa 3 Seater', volume: 3.2, category: 'Living Room', icon: '🛋️', image: '/images/tools-item/medium_sofa.jpg' },
        { id: 'sofa_4seater', name: 'Sofa 4 Seater', volume: 4.0, category: 'Living Room', icon: '🛋️', image: '/images/tools-item/large_sofa.jpg' },
        { id: 'sofa_bed', name: 'Sofa Bed', volume: 3.0, category: 'Living Room', icon: '🛋️', image: '/images/tools-item/Sofa-bed.jpg' },
        { id: 'chaise_longue', name: 'Chaise Longue', volume: 2.8, category: 'Living Room', icon: '🛋️', image: '/images/tools-item/chaise-longue.jpg' },
        { id: 'futon', name: 'Futon', volume: 2.0, category: 'Living Room', icon: '🛋️', image: '/images/tools-item/futon.jpg' },
        { id: 'chair_rocking', name: 'Chair Rocking', volume: 1.5, category: 'Living Room', icon: '🪑', image: '/images/tools-item/rocking_chair.jpg' },
        { id: 'footstool', name: 'Footstool', volume: 0.6, category: 'Living Room', icon: '🪑', image: '/images/tools-item/footstool.jpg' },
        { id: 'ottoman_box', name: 'Ottoman Box', volume: 0.8, category: 'Living Room', icon: '🪑', image: '/images/tools-item/ottoman-box.jpg' },
        
        // Living Room - Tables & Storage  
        { id: 'coffee_table', name: 'Coffee Table', volume: 0.8, category: 'Living Room', icon: '🪑', image: '/images/tools-item/coffee_table.jpg' },
        { id: 'small_table', name: 'Small Table', volume: 0.5, category: 'Living Room', icon: '🪑', image: '/images/tools-item/small-table.jpg' },
        { id: 'hall_table', name: 'Hall Table', volume: 0.7, category: 'Living Room', icon: '🪑', image: '/images/tools-item/hall_table.jpg' },
        { id: 'nest_of_tables', name: 'Nest of Tables', volume: 0.6, category: 'Living Room', icon: '🪑', image: '/images/tools-item/nest_of_tables.jpg' },
        { id: 'tv_stand', name: 'TV Stand', volume: 1.2, category: 'Living Room', icon: '📺', image: '/images/tools-item/tvstand.jpg' },
        { id: 'bookcase_small', name: 'Bookcase Small', volume: 1.0, category: 'Living Room', icon: '📚', image: '/images/tools-item/small-bookcase.jpg' },
        { id: 'bookcase_short', name: 'Bookcase Short', volume: 1.5, category: 'Living Room', icon: '📚', image: '/images/tools-item/short_bookcase.jpg' },
        { id: 'bookcase_tall', name: 'Bookcase Tall', volume: 2.5, category: 'Living Room', icon: '📚', image: '/images/tools-item/bookcase_tall.jpg' },
        { id: 'cabinet_small', name: 'Cabinet Small', volume: 1.2, category: 'Living Room', icon: '🗄️', image: '/images/tools-item/small_oak_cabinet.jpg' },
        { id: 'cabinet_medium', name: 'Cabinet Medium', volume: 1.8, category: 'Living Room', icon: '🗄️', image: '/images/tools-item/medium_oak_cabinet.jpg' },
        { id: 'cabinet_large', name: 'Cabinet Large', volume: 2.5, category: 'Living Room', icon: '🗄️', image: '/images/tools-item/large_cabinet.jpg' },
        { id: 'cd_tower', name: 'CD Tower', volume: 0.4, category: 'Living Room', icon: '💿', image: '/images/tools-item/cd-tower.jpg' },
        { id: 'hi_fi', name: 'Hi Fi', volume: 0.8, category: 'Living Room', icon: '🔊', image: '/images/tools-item/hifi.jpg' },
        { id: 'hi_fi_speaker', name: 'Hi Fi Speaker', volume: 0.3, category: 'Living Room', icon: '🔊', image: '/images/tools-item/hifi-speaker.jpg' },
        { id: 'satellite_box', name: 'Satellite/Freeview Box', volume: 0.1, category: 'Living Room', icon: '📺', image: '/images/tools-item/satellite_box.jpg' },
        { id: 'vcr_dvd', name: 'VCR/DVD/BluRay', volume: 0.15, category: 'Living Room', icon: '📀', image: '/images/tools-item/vcr-player.jpg' },
        
        // Bedroom - Beds
        { id: 'bed_divan_single', name: 'Bed Divan Single', volume: 2.0, category: 'Bedroom', icon: '🛏️', image: '/images/tools-item/single_bed_divan.jpg' },
        { id: 'bed_divan_double', name: 'Bed Divan Double', volume: 2.8, category: 'Bedroom', icon: '🛏️', image: '/images/tools-item/double_divan.jpg' },
        { id: 'bed_divan_queen', name: 'Bed Divan Queen Size', volume: 3.2, category: 'Bedroom', icon: '🛏️', image: '/images/tools-item/divan_queen_size.jpg' },
        { id: 'bed_divan_king', name: 'Bed Divan King Size', volume: 3.8, category: 'Bedroom', icon: '🛏️', image: '/images/tools-item/king_size_divan.jpg' },
        { id: 'bed_frame_single', name: 'Bed Frame Single', volume: 1.8, category: 'Bedroom', icon: '🛏️', image: '/images/tools-item/single_bed_frame.jpg' },
        { id: 'bed_frame_double', name: 'Bed Frame Double', volume: 2.5, category: 'Bedroom', icon: '🛏️', image: '/images/tools-item/double-bed-frame.jpg' },
        { id: 'bed_frame_queen', name: 'Bed Frame Queen Size', volume: 3.0, category: 'Bedroom', icon: '🛏️', image: '/images/tools-item/queen-bed-frame.jpg' },
        { id: 'bed_frame_king', name: 'Bed Frame King Size', volume: 3.5, category: 'Bedroom', icon: '🛏️', image: '/images/tools-item/king-size-bed-frame.jpg' },
        { id: 'bed_bunk', name: 'Bed Bunk', volume: 3.5, category: 'Bedroom', icon: '🛏️', image: '/images/tools-item/bunk-bed.jpg' },
        { id: 'bed_small_childs', name: 'Bed Small Childs', volume: 1.5, category: 'Bedroom', icon: '🛏️', image: '/images/tools-item/child-bed.jpg' },
        { id: 'cot', name: 'Cot', volume: 1.2, category: 'Bedroom', icon: '🍼', image: '/images/tools-item/cot.jpg' },
        
        // Bedroom - Storage
        { id: 'wardrobe_single', name: 'Wardrobe Single', volume: 2.0, category: 'Bedroom', icon: '👔', image: '/images/tools-item/single-wardrobe.jpg' },
        { id: 'wardrobe_double', name: 'Wardrobe Double', volume: 3.2, category: 'Bedroom', icon: '👔', image: '/images/tools-item/double-wardrobe.jpg' },
        { id: 'wardrobe_triple', name: 'Wardrobe Triple', volume: 4.5, category: 'Bedroom', icon: '👔', image: '/images/tools-item/triple-wardrobe.jpg' },
        { id: 'chest_drawers_small', name: 'Chest of Drawers Small', volume: 1.0, category: 'Bedroom', icon: '🗄️', image: '/images/tools-item/small-chest-drawers.jpg' },
        { id: 'chest_drawers_med', name: 'Chest of Drawers Med', volume: 1.5, category: 'Bedroom', icon: '🗄️', image: '/images/tools-item/med-chest-drawers.jpg' },
        { id: 'chest_drawers_large', name: 'Chest of Drawers Large', volume: 2.0, category: 'Bedroom', icon: '🗄️', image: '/images/tools-item/large-chest-drawers.jpg' },
        { id: 'bedside_cabinet', name: 'Bedside Cabinet', volume: 0.5, category: 'Bedroom', icon: '🪑', image: '/images/tools-item/bedside-cabinet.jpg' },
        { id: 'dressing_table', name: 'Dressing Table', volume: 1.5, category: 'Bedroom', icon: '🪑', image: '/images/tools-item/dressing-table.jpg' },
        { id: 'bedroom_chair', name: 'Bedroom Chair', volume: 0.8, category: 'Bedroom', icon: '🪑', image: '/images/tools-item/contemporary-armchairs-and-accent-chairs.jpg' },
        { id: 'nursery_chest', name: 'Nursery Chest/Dresser', volume: 1.8, category: 'Bedroom', icon: '🍼', image: '/images/tools-item/Nursery ChestDresser.jpg' },
        
        // Dining Room
        { id: 'dining_table_small', name: 'Small Dining Table', volume: 1.5, category: 'Dining Room', icon: '🍽️', image: '/images/tools-item/small-meeting-table.jpg' },
        { id: 'dining_table_medium', name: 'Medium Dining Table', volume: 2.5, category: 'Dining Room', icon: '🍽️', image: '/images/tools-item/breakfast-table.jpg' },
        { id: 'dining_table_large', name: 'Large Dining Table', volume: 3.5, category: 'Dining Room', icon: '🍽️', image: '/images/tools-item/meeting_table.jpg' },
        { id: 'dining_chair', name: 'Dining Chair', volume: 0.6, category: 'Dining Room', icon: '🪑', image: '/images/tools-item/dining_chair.jpg' },
        { id: 'chair_breakfast', name: 'Chair Breakfast', volume: 0.5, category: 'Dining Room', icon: '🪑', image: '/images/tools-item/kitchen_chair.jpg' },
        { id: 'sideboard_small', name: 'Sideboard Small', volume: 1.5, category: 'Dining Room', icon: '🗄️', image: '/images/tools-item/small_sideboard.jpg' },
        { id: 'sideboard_medium', name: 'Sideboard Medium', volume: 2.2, category: 'Dining Room', icon: '🗄️', image: '/images/tools-item/sideboard_medium.jpg' },
        { id: 'sideboard_large', name: 'Sideboard Large', volume: 3.0, category: 'Dining Room', icon: '🗄️', image: '/images/tools-item/large_sideboard.jpg' },
        { id: 'welsh_dresser', name: 'Welsh Dresser', volume: 3.5, category: 'Dining Room', icon: '🗄️', image: '/images/tools-item/welsh_dresser.jpg' },
        
        // Kitchen - Appliances
        { id: 'fridge_small', name: 'Freezer or Fridge Small', volume: 1.2, category: 'Kitchen', icon: '❄️', image: '/images/tools-item/fridge-office.jpg' },
        { id: 'fridge_freezer', name: 'Fridge Freezer', volume: 2.0, category: 'Kitchen', icon: '❄️', image: '/images/tools-item/fridge-freezer.jpg' },
        { id: 'fridge_freezer_us', name: 'Fridge Freezer US Style', volume: 3.5, category: 'Kitchen', icon: '❄️', image: '/images/tools-item/american-fridge-freezer.jpg' },
        { id: 'freezer_chest', name: 'Freezer Chest', volume: 1.8, category: 'Kitchen', icon: '❄️', image: '/images/tools-item/large-chest-freezer.jpg' },
        { id: 'freezer_tall', name: 'Freezer Tall', volume: 2.5, category: 'Kitchen', icon: '❄️', image: '/images/tools-item/tall-freezer.jpg' },
        { id: 'washing_machine', name: 'Washing Machine', volume: 1.5, category: 'Kitchen', icon: '🌊', image: '/images/tools-item/washing-machine.jpg' },
        { id: 'dryer', name: 'Dryer', volume: 1.5, category: 'Kitchen', icon: '🌀', image: '/images/tools-item/dryer.jpg' },
        { id: 'dishwasher', name: 'Dishwasher', volume: 1.2, category: 'Kitchen', icon: '🍽️', image: '/images/tools-item/dishwasher.jpg' },
        { id: 'cooker_small', name: 'Cooker Small', volume: 1.5, category: 'Kitchen', icon: '🔥', image: '/images/tools-item/cooker.jpg' },
        { id: 'cooker_large', name: 'Cooker Large', volume: 2.0, category: 'Kitchen', icon: '🔥', image: '/images/tools-item/large-cooker.jpg' },
        { id: 'cooker_range', name: 'Cooker Range', volume: 2.5, category: 'Kitchen', icon: '🔥', image: '/images/tools-item/cooker-range.jpg' },
        { id: 'microwave', name: 'Microwave', volume: 0.3, category: 'Kitchen', icon: '📻', image: '/images/tools-item/microwave2.jpg' },
        { id: 'kitchen_cabinet', name: 'Kitchen Cabinet', volume: 1.5, category: 'Kitchen', icon: '🗄️', image: '/images/tools-item/kitchen-cabinet.jpg' },
        { id: 'table_breakfast', name: 'Table Breakfast', volume: 1.2, category: 'Kitchen', icon: '🍽️', image: '/images/tools-item/breakfast-table.jpg' },
        
        // Office
        { id: 'office_desk', name: 'Office Desk', volume: 1.8, category: 'Office', icon: '💻', image: '/images/tools-item/office_desk.jpg' },
        { id: 'desk_pedestal', name: 'Desk Pedestal', volume: 2.2, category: 'Office', icon: '💻', image: '/images/tools-item/desk-pedistal.jpg' },
        { id: 'computer_desk', name: 'Computer Desk', volume: 1.5, category: 'Office', icon: '🖥️', image: '/images/tools-item/computer-desk.jpg' },
        { id: 'writing_desk', name: 'Writing Desk', volume: 1.3, category: 'Office', icon: '✍️', image: '/images/tools-item/writing_desk.jpg' },
        { id: 'bureau', name: 'Bureau', volume: 1.8, category: 'Office', icon: '✍️', image: '/images/tools-item/bureau.jpg' },
        { id: 'executive_chair', name: 'Executive Chair', volume: 1.2, category: 'Office', icon: '🪑' },
        { id: 'swivel_chair', name: 'Swivel Chair', volume: 0.9, category: 'Office', icon: '🪑', image: '/images/tools-item/office-swivel.jpg' },
        { id: 'static_chair', name: 'Static Chair', volume: 0.8, category: 'Office', icon: '🪑' },
        { id: 'filing_cabinet_2', name: 'Filing Cabinet 2 Drawer', volume: 0.8, category: 'Office', icon: '🗄️', image: '/images/tools-item/filing-cab-4-drawer.jpg' },
        { id: 'filing_cabinet_4', name: 'Filing Cabinet 4 Drawer', volume: 1.5, category: 'Office', icon: '🗄️', image: '/images/tools-item/4drawer-filing.jpg' },
        { id: 'meeting_table', name: 'Meeting Table', volume: 3.0, category: 'Office', icon: '🪑', image: '/images/tools-item/meeting_table.jpg' },
        
        // Electronics
        { id: 'tv_flat_small', name: 'TV Flat Screen Small', volume: 0.3, category: 'Electronics', icon: '📺', image: '/images/tools-item/small_flatscreen.jpg' },
        { id: 'tv_flat_large', name: 'TV Flat Screen Large', volume: 0.8, category: 'Electronics', icon: '📺', image: '/images/tools-item/large_flatscreen.jpg' },
        { id: 'tv_tube_small', name: 'TV Tube Small', volume: 0.5, category: 'Electronics', icon: '📺', image: '/images/tools-item/small-tube-tv.jpg' },
        { id: 'tv_tube_large', name: 'TV Tube Large', volume: 1.0, category: 'Electronics', icon: '📺', image: '/images/tools-item/tv-tube-large.jpg' },
        { id: 'computer_desktop', name: 'Computer Desktop', volume: 0.4, category: 'Electronics', icon: '🖥️', image: '/images/tools-item/desktop.jpg' },
        { id: 'computer_laptop', name: 'Computer Laptop', volume: 0.05, category: 'Electronics', icon: '💻', image: '/images/tools-item/laptop.jpg' },
        { id: 'computer_monitor', name: 'Computer Monitor', volume: 0.3, category: 'Electronics', icon: '🖥️', image: '/images/tools-item/monitor.jpg' },
        { id: 'monitor_flat', name: 'Monitor Flat', volume: 0.2, category: 'Electronics', icon: '🖥️', image: '/images/tools-item/flat-monitor.jpg' },
        { id: 'printer', name: 'Printer', volume: 0.3, category: 'Electronics', icon: '🖨️', image: '/images/tools-item/HO-printer.jpg' },
        { id: 'printer_network', name: 'Printer Network', volume: 0.5, category: 'Electronics', icon: '🖨️', image: '/images/tools-item/office-netwrok-printer.jpg' },
        { id: 'photocopier', name: 'Photocopier', volume: 1.2, category: 'Electronics', icon: '🖨️', image: '/images/tools-item/photocopier.jpg' },
        { id: 'fax_machine', name: 'Fax Machine', volume: 0.3, category: 'Electronics', icon: '📠', image: '/images/tools-item/fax.jpg' },
        { id: 'server_cabinet_3ft', name: 'Server Cabinet 3ft', volume: 2.0, category: 'Electronics', icon: '🖥️', image: '/images/tools-item/Server Cabinet 3ft.jpg' },
        { id: 'server_cabinet_6ft', name: 'Server Cabinet 6ft', volume: 4.0, category: 'Electronics', icon: '🖥️', image: '/images/tools-item/Server Cabinet 6ft.jpg' },
        { id: 'hard_drive', name: 'Hard Drive', volume: 0.1, category: 'Electronics', icon: '💾', image: '/images/tools-item/Hard Drive.jpg' },
        
        // Musical Instruments
        { id: 'piano_upright', name: 'Piano Upright', volume: 4.5, category: 'Music', icon: '🎹', image: '/images/tools-item/upright_piano.jpg' },
        { id: 'piano_baby_grand', name: 'Piano Baby Grand', volume: 6.0, category: 'Music', icon: '🎹', image: '/images/tools-item/baby-grand-piano.jpg' },
        { id: 'grand_piano', name: 'Grand Piano', volume: 8.0, category: 'Music', icon: '🎹', image: '/images/tools-item/grand-piano.jpg' },
        { id: 'piano_stool', name: 'Piano Stool', volume: 0.5, category: 'Music', icon: '🎹', image: '/images/tools-item/piano_stool.jpg' },
        
        // Boxes & Storage
        { id: 'pack_2', name: 'Pack 2 (Large Box)', volume: 0.18, category: 'Storage', icon: '📦', image: '/images/tools-item/packing_box_large1.jpg' },
        { id: 'pack_6', name: 'Pack 6 (Small Box)', volume: 0.06, category: 'Storage', icon: '📦', image: '/images/tools-item/packing_box_small1.jpg' },
        { id: 'boxed_3cuft', name: 'Boxed Already 3cuft', volume: 0.085, category: 'Storage', icon: '📦', image: '/images/tools-item/Packaging_old_outer_carton_.jpg' },
        { id: 'archive_boxes', name: 'Archive Boxes', volume: 0.04, category: 'Storage', icon: '📦', image: '/images/tools-item/archive-box.jpg' },
        { id: 'suitcases', name: 'Suitcases', volume: 0.3, category: 'Storage', icon: '🧳', image: '/images/tools-item/suitcase.jpg' },
        { id: 'trunk', name: 'Trunk', volume: 0.8, category: 'Storage', icon: '🧳', image: '/images/tools-item/trunk.jpg' },
        { id: 'crates', name: 'Crates', volume: 0.15, category: 'Storage', icon: '📦', image: '/images/tools-item/office-crate.jpg' },
        { id: 'bags', name: 'Bags', volume: 0.1, category: 'Storage', icon: '👜', image: '/images/tools-item/bag.jpg' },
        
        // Garden & Outdoor
        { id: 'garden_table', name: 'Garden Table', volume: 1.5, category: 'Garden', icon: '🪑', image: '/images/tools-item/garden-table.jpg' },
        { id: 'garden_chair', name: 'Garden Chair', volume: 0.8, category: 'Garden', icon: '🪑', image: '/images/tools-item/garden-chair.jpg' },
        { id: 'stacking_chair', name: 'Stacking Chair', volume: 0.6, category: 'Garden', icon: '🪑', image: '/images/tools-item/stacking-garden-chair.jpg' },
        { id: 'folding_chair', name: 'Folding Chair', volume: 0.5, category: 'Garden', icon: '🪑', image: '/images/tools-item/folding-garden-chair.jpg' },
        { id: 'garden_bench', name: 'Garden Bench', volume: 1.2, category: 'Garden', icon: '🪑', image: '/images/tools-item/garden-bench.jpg' },
        { id: 'garden_lounger', name: 'Garden Lounger', volume: 1.5, category: 'Garden', icon: '🪑', image: '/images/tools-item/lounger.jpg' },
        { id: 'picnic_table', name: 'Picnic Table', volume: 2.0, category: 'Garden', icon: '🪑', image: '/images/tools-item/picnic-table.jpg' },
        { id: 'parasol', name: 'Parasol', volume: 0.5, category: 'Garden', icon: '☂️', image: '/images/tools-item/parasol-1.jpg' },
        { id: 'portable_bbq', name: 'Portable BBQ', volume: 1.2, category: 'Garden', icon: '🔥', image: '/images/tools-item/bbq.jpg' },
        { id: 'heater_gas', name: 'Heater Gas', volume: 0.8, category: 'Garden', icon: '🔥', image: '/images/tools-item/patio-heater.jpg' },
        { id: 'mower_elec', name: 'Mower Elec', volume: 1.0, category: 'Garden', icon: '🌱', image: '/images/tools-item/mower.jpg' },
        { id: 'mower_petrol', name: 'Mower Petrol', volume: 1.3, category: 'Garden', icon: '🌱', image: '/images/tools-item/petrol-mower.jpg' },
        { id: 'ride_on_mower', name: 'Ride on Mower', volume: 3.5, category: 'Garden', icon: '🌱', image: '/images/tools-item/ride-on-mower.jpg' },
        { id: 'strimmer', name: 'Strimmer', volume: 0.6, category: 'Garden', icon: '🌱', image: '/images/tools-item/strimmer.jpg' },
        { id: 'wheelbarrow', name: 'Wheelbarrow', volume: 0.9, category: 'Garden', icon: '🛞', image: '/images/tools-item/wheelbarrow.jpg' },
        { id: 'garden_hose', name: 'Garden Hose', volume: 0.2, category: 'Garden', icon: '💧', image: '/images/tools-item/hose.jpg' },
        { id: 'outdoor_bin', name: 'Outdoor Bin', volume: 0.5, category: 'Garden', icon: '🗑️', image: '/images/tools-item/outdoor-bin.jpg' },
        { id: 'plant_indoor', name: 'Indoor Plant', volume: 0.3, category: 'Garden', icon: '🪴', image: '/images/tools-item/Indoor Plant.jpg' },
        { id: 'plant_large', name: 'Large Plant', volume: 0.8, category: 'Garden', icon: '🌿', image: '/images/tools-item/Indoor Plant.jpg' },
        { id: 'plant_outdoor_small', name: 'Small Outdoor Plant', volume: 0.4, category: 'Garden', icon: '🌱', image: '/images/tools-item/small-outdoor-plant.jpg' },
        { id: 'plant_outdoor_medium', name: 'Medium Outdoor Plant', volume: 0.6, category: 'Garden', icon: '🌿', image: '/images/tools-item/Medium Outdoor Plant.jpg' },
        { id: 'plant_outdoor_large', name: 'Large Outdoor Plant', volume: 1.0, category: 'Garden', icon: '🌳', image: '/images/tools-item/Large Outdoor Plant.jpeg' },
        { id: 'garden_ornament', name: 'Garden Ornament', volume: 0.4, category: 'Garden', icon: '🗿' },
        
        // Garage & Tools
        { id: 'bicycle', name: 'Bicycle', volume: 1.0, category: 'Garage', icon: '🚲', image: '/images/tools-item/bike.jpg' },
        { id: 'child_bicycle', name: "Child's Bicycle", volume: 0.6, category: 'Garage', icon: '🚲', image: '/images/tools-item/child-bike.jpg' },
        { id: 'workbench', name: 'Workbench', volume: 2.5, category: 'Garage', icon: '🔨', image: '/images/tools-item/workbench.jpg' },
        { id: 'tool_case', name: 'Tool Case', volume: 0.3, category: 'Garage', icon: '🧰', image: '/images/tools-item/toolcase.jpg' },
        { id: 'tool_cabinet', name: 'Tool Cabinet', volume: 2.0, category: 'Garage', icon: '🧰', image: '/images/tools-item/tool-cabinet.jpg' },
        { id: 'ladder', name: 'Ladder', volume: 0.5, category: 'Garage', icon: '🪜', image: '/images/tools-item/ladder.jpg' },
        { id: 'step_ladder', name: 'Step Ladder', volume: 0.7, category: 'Garage', icon: '🪜', image: '/images/tools-item/step-ladder.jpg' },
        { id: 'car_roof_box', name: 'Car Roof Box', volume: 1.5, category: 'Garage', icon: '🚗', image: '/images/tools-item/roof-box.jpg' },
        { id: 'spare_tyre', name: 'Spare Tyre', volume: 0.4, category: 'Garage', icon: '🛞', image: '/images/tools-item/spare-tyre.jpg' },
        
        // Recreation & Sports
        { id: 'exercise_bike', name: 'Exercise Bike', volume: 1.5, category: 'Sports', icon: '🚴', image: '/images/tools-item/exercise-bike.jpg' },
        { id: 'running_machine', name: 'Running Machine', volume: 3.2, category: 'Sports', icon: '🏃', image: '/images/tools-item/running-machine.jpg' },
        { id: 'weights_machine', name: 'Weights Machine', volume: 2.5, category: 'Sports', icon: '🏋️', image: '/images/tools-item/weight-machine.jpg' },
        { id: 'golf_clubs', name: 'Golf Clubs Bag', volume: 0.3, category: 'Sports', icon: '⛳', image: '/images/tools-item/golf-bag.jpg' },
        { id: 'canoe', name: 'Canoe', volume: 2.5, category: 'Sports', icon: '🛶', image: '/images/tools-item/canoe.jpg' },
        { id: 'skis_snowboard', name: 'Skis Snowboard', volume: 0.5, category: 'Sports', icon: '🎿', image: '/images/tools-item/snowboard.jpg' },
        { id: 'pool_table', name: 'Pool Table', volume: 5.0, category: 'Sports', icon: '🎱', image: '/images/tools-item/pool-table.jpg' },
        { id: 'snooker_table', name: 'Snooker Table 6ft', volume: 6.0, category: 'Sports', icon: '🎱', image: '/images/tools-item/snooker-table.jpg' },
        { id: 'table_tennis', name: 'Table Tennis Table', volume: 1.5, category: 'Sports', icon: '🏓', image: '/images/tools-item/table-tennis.jpg' },
        
        // Children's Items
        { id: 'climbing_frame', name: 'Climbing Frame', volume: 4.0, category: 'Children', icon: '🧗', image: '/images/tools-item/climbing-frame.jpg' },
        { id: 'trampoline', name: 'Trampoline', volume: 3.5, category: 'Children', icon: '🤸', image: '/images/tools-item/trampoline.jpg' },
        { id: 'swing', name: 'Swing', volume: 2.0, category: 'Children', icon: '🛝', image: '/images/tools-item/swing.jpg' },
        { id: 'slide', name: 'Slide', volume: 2.5, category: 'Children', icon: '🛝', image: '/images/tools-item/slide.jpg' },
        { id: 'wendy_house', name: 'Wendy House', volume: 4.5, category: 'Children', icon: '🏠', image: '/images/tools-item/wendy-house.jpg' },
        { id: 'sandpit', name: 'Sandpit', volume: 1.5, category: 'Children', icon: '🏖️', image: '/images/tools-item/sandpit.jpg' },
        { id: 'playpen', name: 'Play Pen', volume: 1.0, category: 'Children', icon: '🍼', image: '/images/tools-item/play-pen.jpg' },
        { id: 'pushchairs', name: 'Pushchairs', volume: 0.8, category: 'Children', icon: '🍼', image: '/images/tools-item/pushchair.jpg' },
        { id: 'baby_high_chair', name: 'Baby High Chair', volume: 0.7, category: 'Children', icon: '🍼', image: '/images/tools-item/child-chair.jpg' },
        { id: 'chair_child', name: 'Chair Child', volume: 0.3, category: 'Children', icon: '🪑', image: '/images/tools-item/child-chair.jpg' },
        
        // Miscellaneous
        { id: 'mirror_small', name: 'Mirror Small', volume: 0.3, category: 'Miscellaneous', icon: '🪞', image: '/images/tools-item/small_mirror.jpg' },
        { id: 'mirror_large', name: 'Mirror Large', volume: 0.6, category: 'Miscellaneous', icon: '🪞', image: '/images/tools-item/large_mirror.jpg' },
        { id: 'picture_small', name: 'Picture Small', volume: 0.1, category: 'Miscellaneous', icon: '🖼️', image: '/images/tools-item/pic-frame-small.jpg' },
        { id: 'picture_large', name: 'Picture Large', volume: 0.3, category: 'Miscellaneous', icon: '🖼️', image: '/images/tools-item/pic-frame-large.jpg' },
        { id: 'rug_small', name: 'Rug Small', volume: 0.2, category: 'Miscellaneous', icon: '🟫' },
        { id: 'rug_large', name: 'Rug Large', volume: 0.5, category: 'Miscellaneous', icon: '🟫' },
        { id: 'lamp_floor', name: 'Lamp Floor', volume: 0.4, category: 'Miscellaneous', icon: '💡', image: '/images/tools-item/floor_lamp.jpg' },
        { id: 'lamp_table', name: 'Table Lamp', volume: 0.2, category: 'Miscellaneous', icon: '💡', image: '/images/tools-item/side-lamp.jpg' },
        { id: 'vacuum_cleaner', name: 'Vacuum Cleaner', volume: 0.4, category: 'Miscellaneous', icon: '🧹', image: '/images/tools-item/Vacuum Cleaner.jpg' },
        { id: 'ironing_board', name: 'Ironing Board', volume: 0.3, category: 'Miscellaneous', icon: '👕', image: '/images/tools-item/ironing-board.jpg' },
        { id: 'clothes_basket', name: 'Clothes Basket', volume: 0.3, category: 'Miscellaneous', icon: '🧺', image: '/images/tools-item/clothes-basket.jpg' },
        { id: 'bin', name: 'Bin', volume: 0.2, category: 'Miscellaneous', icon: '🗑️', image: '/images/tools-item/kitchen-bin.jpg' },
        { id: 'fan', name: 'Fan', volume: 0.4, category: 'Miscellaneous', icon: '💨', image: '/images/tools-item/office-fan.jpg' },
        { id: 'dehumidifier', name: 'Dehumidifier', volume: 0.5, category: 'Miscellaneous', icon: '💧', image: '/images/tools-item/dehumidifier.jpg' },
        { id: 'air_con_unit', name: 'Air Con Unit', volume: 0.8, category: 'Miscellaneous', icon: '❄️', image: '/images/tools-item/aircon-unit.jpg' },
        { id: 'stool', name: 'Stool', volume: 0.4, category: 'Miscellaneous', icon: '🪑', image: '/images/tools-item/stool.jpg' },
        { id: 'sundry_cuft', name: 'Sundry Cuft', volume: 0.028, category: 'Miscellaneous', icon: '📦' },
        
        // Additional fragile items
        { id: 'wine_rack', name: 'Wine Rack', volume: 0.5, category: 'Kitchen', icon: '🍷', image: '/images/tools-item/wine-rack.jpg' },
        { id: 'glass_cabinet', name: 'Glass Cabinet', volume: 1.2, category: 'Living Room', icon: '🪟', image: '/images/tools-item/glass-cabinet.jpg' },
        { id: 'china_cabinet', name: 'China Cabinet', volume: 1.5, category: 'Dining Room', icon: '🏺', image: '/images/tools-item/china-cabinet.jpg' },
        { id: 'vase', name: 'Vase', volume: 0.1, category: 'Miscellaneous', icon: '🏺', image: '/images/tools-item/vase.jpg' },
        { id: 'ornament', name: 'Ornament', volume: 0.05, category: 'Miscellaneous', icon: '🗿', image: '/images/tools-item/ornament.jpg' }
    ];

    // List of fragile items with realistic packing requirements
    const fragileItemPackingMap: { [key: string]: number } = {
        // Mirrors and Pictures (need flat packing with padding)
        'mirror_small': 0.5,        // Small mirror needs half a box with padding
        'mirror_large': 1.0,        // Large mirror needs 1 full box with padding
        'picture_small': 0.25,      // Small pictures can share boxes
        'picture_large': 0.5,       // Large pictures need half a box
        
        // TVs and Monitors (need custom boxes with foam)
        'tv_flat_small': 0.7,       // Small TV with protective foam
        'tv_flat_large': 1.5,       // Large TV needs 1.5 boxes with padding
        'tv_tube_small': 1.0,       // Tube TVs are heavier, need more protection
        'tv_tube_large': 2.0,       // Large tube TVs need 2 boxes worth of protection
        'computer_monitor': 0.7,     // Monitor with protective padding
        'monitor_flat': 0.5,        // Flat monitor with padding
        
        // Lamps (awkward shapes need careful packing)
        'lamp_floor': 0.8,          // Floor lamp with shade protection
        'lamp_table': 0.3,          // Table lamp can share box space
        
        // Kitchen appliances (medium protection needed)
        'microwave': 0.8,           // Microwave with padding
        'toaster': 0.3,             // Small appliance
        'kettle': 0.25,             // Small appliance
        'blender': 0.3,             // Small appliance
        'coffee_machine': 0.4,      // Medium appliance
        
        // Glass furniture and cabinets
        'wine_rack': 0.6,           // Wine rack with glass protection
        'glass_cabinet': 1.2,       // Glass panels need careful packing
        'china_cabinet': 1.5,       // Large glass cabinet with dishes
        
        // Small decorative items (can be grouped)
        'vase': 0.2,                // Vases can be packed together
        'ornament': 0.15,           // Small ornaments can share boxes
        'garden_ornament': 0.4      // Garden ornaments need some protection
    };

    // List of fragile items that require special packing
    const fragileItems = Object.keys(fragileItemPackingMap);

    const truckSizes: TruckSize[] = [
        { name: 'Small Van', volume: 10, description: 'Studio apartment or 1-bedroom', icon: '🚐', price: '£80-120' },
        { name: 'Medium Van', volume: 20, description: '2-bedroom flat or small house', icon: '🚚', price: '£120-180' },
        { name: 'Large Van', volume: 35, description: '3-bedroom house', icon: '🚛', price: '£180-250' },
        { name: 'Luton Van', volume: 50, description: '4-bedroom house or large home', icon: '🚚', price: '£220-300' },
        { name: 'Removal Lorry', volume: 75, description: '5+ bedroom house or office move', icon: '🚛', price: '£300-500' }
    ];

    const [rooms, setRooms] = useState<Room[]>([
        { id: '1', name: 'Hallway', items: {}, selectedBoxSize: boxSizes[0] },
        { id: '2', name: 'Lounge', items: {}, selectedBoxSize: boxSizes[0] },
        { id: '3', name: 'Kitchen', items: {}, selectedBoxSize: boxSizes[0] },
        { id: '4', name: 'Dining Room', items: {}, selectedBoxSize: boxSizes[0] },
        { id: '5', name: 'Bedroom 1', items: {}, selectedBoxSize: boxSizes[0] },
        { id: '6', name: 'Loft', items: {}, selectedBoxSize: boxSizes[0] },
        { id: '7', name: 'Garden', items: {}, selectedBoxSize: boxSizes[0] },
        { id: '8', name: 'Garage', items: {}, selectedBoxSize: boxSizes[0] }
    ]);

    const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [customItems, setCustomItems] = useState<FurnitureItem[]>([]);
    const [selectedBoxSize, setSelectedBoxSize] = useState<BoxSize>(boxSizes[0]); // Default to Medium
    
    // New state for unassigned items and modal
    const [unassignedItems, setUnassignedItems] = useState<UnassignedItem[]>([]);
    const [roomSelectionModal, setRoomSelectionModal] = useState<RoomSelectionModal>({
        isOpen: false,
        selectedItem: null
    });
    
    // Get preset items for current room
    const getPresetItemsForRoom = (roomName: string): FurnitureItem[] => {
        const presetIds = presetRoomItems[roomName] || [];
        return presetIds
            .map(id => furnitureDatabase.find(item => item.id === id))
            .filter((item): item is FurnitureItem => item !== undefined);
    };
    
    // Get alphabetically sorted all items
    const getAllItemsSorted = (): FurnitureItem[] => {
        return [...furnitureDatabase, ...customItems].sort((a, b) => a.name.localeCompare(b.name));
    };

    // Calculate total volume
    const calculateTotalVolume = (): number => {
        let total = 0;
        
        // Volume from rooms
        rooms.forEach(room => {
            Object.entries(room.items).forEach(([itemId, quantity]) => {
                const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                if (item) {
                    total += item.volume * quantity;
                }
            });
        });
        
        // Volume from unassigned items
        unassignedItems.forEach(unassignedItem => {
            const item = [...furnitureDatabase, ...customItems].find(f => f.id === unassignedItem.itemId);
            if (item) {
                total += item.volume * unassignedItem.quantity;
            }
        });
        
        return total;
    };

    // Calculate box volume with automatic fragile box calculation
    const calculateBoxVolume = (): { 
        totalBoxes: number; 
        estimatedVolumeM3: number; 
        warning: string | null;
        regularBoxCount: number;
        autoFragileBoxCount: number;
        totalFragileBoxCount: number;
    } => {
        const SELECTED_BOX_VOLUME = selectedBoxSize.volume;
        const BOXABLE_ITEM_THRESHOLD = 0.14; // Items smaller than this can potentially fit in boxes
        
        let regularBoxCount = 0;
        let autoFragileBoxCount = 0;
        
        // Calculate automatic fragile boxes and regular box counts
        rooms.forEach(room => {
            const ROOM_BOX_VOLUME = room.selectedBoxSize?.volume || selectedBoxSize.volume;
            
            // Calculate automatic regular boxes for boxable non-fragile items
            let regularBoxableVolume = 0;
            Object.entries(room.items).forEach(([itemId, quantity]) => {
                const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                if (item && item.volume < BOXABLE_ITEM_THRESHOLD && !fragileItems.includes(itemId)) {
                    regularBoxableVolume += item.volume * quantity;
                }
            });
            
            const roomAutoRegularBoxes = Math.ceil(regularBoxableVolume / ROOM_BOX_VOLUME);
            regularBoxCount += roomAutoRegularBoxes;
            room.autoRegularBoxCount = roomAutoRegularBoxes;
            
            // Calculate automatic fragile boxes based on realistic packing needs
            let fragileBoxesNeeded = 0;
            Object.entries(room.items).forEach(([itemId, quantity]) => {
                if (fragileItems.includes(itemId)) {
                    const packingRequirement = fragileItemPackingMap[itemId];
                    if (packingRequirement) {
                        // Adjust packing requirement based on room's selected box size
                        const adjustedPacking = (packingRequirement * 0.14) / ROOM_BOX_VOLUME;
                        fragileBoxesNeeded += adjustedPacking * quantity;
                    }
                }
            });
            
            // Round up to nearest whole box
            const roomAutoFragileBoxes = Math.ceil(fragileBoxesNeeded);
            autoFragileBoxCount += roomAutoFragileBoxes;
            
            // Update room with auto fragile box count
            room.autoFragileBoxCount = roomAutoFragileBoxes;
        });

        // Also check unassigned items for regular and fragile items
        unassignedItems.forEach(unassignedItem => {
            const item = [...furnitureDatabase, ...customItems].find(f => f.id === unassignedItem.itemId);
            if (item) {
                if (fragileItems.includes(unassignedItem.itemId)) {
                    // Handle fragile items
                    const packingRequirement = fragileItemPackingMap[unassignedItem.itemId];
                    if (packingRequirement) {
                        const adjustedPacking = (packingRequirement * 0.14) / SELECTED_BOX_VOLUME;
                        autoFragileBoxCount += Math.ceil(adjustedPacking * unassignedItem.quantity);
                    }
                } else if (item.volume < BOXABLE_ITEM_THRESHOLD) {
                    // Handle regular boxable items
                    const itemVolume = item.volume * unassignedItem.quantity;
                    regularBoxCount += Math.ceil(itemVolume / SELECTED_BOX_VOLUME);
                }
            }
        });

        const totalFragileBoxCount = autoFragileBoxCount;
        const totalAllBoxes = regularBoxCount + totalFragileBoxCount;
        
        // Calculate estimated volume using room-specific box sizes
        let estimatedVolumeM3 = 0;
        rooms.forEach(room => {
            const roomBoxVolume = room.selectedBoxSize?.volume || selectedBoxSize.volume;
            const roomTotalBoxes = (room.autoRegularBoxCount || 0) + (room.autoFragileBoxCount || 0);
            estimatedVolumeM3 += roomTotalBoxes * roomBoxVolume;
        });
        
        // Add unassigned items volume
        const unassignedBoxVolume = (regularBoxCount - rooms.reduce((sum, room) => sum + (room.autoRegularBoxCount || 0), 0)) + 
                                   (autoFragileBoxCount - rooms.reduce((sum, room) => sum + (room.autoFragileBoxCount || 0), 0));
        estimatedVolumeM3 += unassignedBoxVolume * selectedBoxSize.volume;
        
        // Calculate only "boxable" furniture volume (items < 0.14m³)
        let boxableFurnitureVolume = 0;
        
        // Volume from rooms (excluding fragile items since they're auto-calculated)
        rooms.forEach(room => {
            Object.entries(room.items).forEach(([itemId, quantity]) => {
                const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                if (item && item.volume < BOXABLE_ITEM_THRESHOLD && !fragileItems.includes(itemId)) {
                    boxableFurnitureVolume += item.volume * quantity;
                }
            });
        });
        
        // Volume from unassigned items (excluding fragile items since they're auto-calculated)
        unassignedItems.forEach(unassignedItem => {
            const item = [...furnitureDatabase, ...customItems].find(f => f.id === unassignedItem.itemId);
            if (item && item.volume < BOXABLE_ITEM_THRESHOLD && !fragileItems.includes(unassignedItem.itemId)) {
                boxableFurnitureVolume += item.volume * unassignedItem.quantity;
            }
        });
        
        const totalBoxableVolume = boxableFurnitureVolume + (regularBoxCount * SELECTED_BOX_VOLUME);
        
        let warning = null;
        
        // No warning message needed for automatic calculation
        warning = null;

        return {
            totalBoxes: totalAllBoxes,
            estimatedVolumeM3,
            warning,
            regularBoxCount,
            autoFragileBoxCount,
            totalFragileBoxCount
        };
    };

    // Calculate total volume including boxes
    const calculateTotalVolumeWithBoxes = (): number => {
        const furnitureVolume = calculateTotalVolume();
        const boxData = calculateBoxVolume();
        return furnitureVolume + boxData.estimatedVolumeM3;
    };





    // Get recommended truck
    const getRecommendedTruck = (): TruckSize => {
        const totalVolume = calculateTotalVolumeWithBoxes();
        const truck = truckSizes.find(truck => truck.volume >= totalVolume) || truckSizes[truckSizes.length - 1];
        return truck;
    };

    // Add room
    const addRoom = () => {
        const newRoom: Room = {
            id: Date.now().toString(),
            name: `Room ${rooms.length + 1}`,
            items: {}
        };
        setRooms(prev => [...prev, newRoom]);
    };

    // Remove room
    const removeRoom = (roomId: string) => {
        setRooms(prev => prev.filter(room => room.id !== roomId));
    };

    // Update room name
    const updateRoomName = (roomId: string, newName: string) => {
        setRooms(prev => prev.map(room => 
            room.id === roomId ? { ...room, name: newName } : room
        ));
    };
    
    // Update room box size
    const updateRoomBoxSize = (roomId: string, boxSize: BoxSize) => {
        setRooms(prev => prev.map(room => 
            room.id === roomId ? { ...room, selectedBoxSize: boxSize } : room
        ));
    };

    // Open room selection modal
    const openRoomSelectionModal = (item: FurnitureItem) => {
        setRoomSelectionModal({
            isOpen: true,
            selectedItem: item
        });
    };
    
    // Close room selection modal
    const closeRoomSelectionModal = () => {
        setRoomSelectionModal({
            isOpen: false,
            selectedItem: null
        });
    };
    
    // Navigation functions
    const goToNextRoom = () => {
        if (currentRoomIndex < rooms.length - 1) {
            setCurrentRoomIndex(currentRoomIndex + 1);
        }
    };
    
    const goToPreviousRoom = () => {
        if (currentRoomIndex > 0) {
            setCurrentRoomIndex(currentRoomIndex - 1);
        }
    };
    
    const goToRoom = (index: number) => {
        setCurrentRoomIndex(index);
    };
    
    // Add item to specific room
    const addItemToRoom = (roomId: string, itemId: string, quantity: number = 1) => {
        setRooms(prev => prev.map(room => {
            if (room.id === roomId) {
                const currentQuantity = room.items[itemId] || 0;
                return {
                    ...room,
                    items: { ...room.items, [itemId]: currentQuantity + quantity }
                };
            }
            return room;
        }));
    };
    
    // Add item to current room
    const addItemToCurrentRoom = (itemId: string, quantity: number = 1) => {
        const currentRoom = rooms[currentRoomIndex];
        if (currentRoom) {
            addItemToRoom(currentRoom.id, itemId, quantity);
        }
    };
    
    // Increment item in current room
    const incrementItem = (itemId: string) => {
        addItemToCurrentRoom(itemId, 1);
    };
    
    // Decrement item in current room  
    const decrementItem = (itemId: string) => {
        const currentRoom = rooms[currentRoomIndex];
        if (currentRoom) {
            removeItemFromRoom(currentRoom.id, itemId);
        }
    };
    
    // Get quantity of item in current room
    const getItemQuantity = (itemId: string): number => {
        const currentRoom = rooms[currentRoomIndex];
        return currentRoom?.items[itemId] || 0;
    };
    
    // Add item without assigning to room
    const addItemUnassigned = (itemId: string, quantity: number = 1) => {
        setUnassignedItems(prev => {
            const existingItem = prev.find(item => item.itemId === itemId);
            if (existingItem) {
                return prev.map(item => 
                    item.itemId === itemId 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prev, { itemId, quantity }];
            }
        });
    };

    // Remove item from room
    const removeItemFromRoom = (roomId: string, itemId: string) => {
        setRooms(prev => prev.map(room => {
            if (room.id === roomId) {
                const newItems = { ...room.items };
                if (newItems[itemId] > 1) {
                    newItems[itemId]--;
                } else {
                    delete newItems[itemId];
                }
                return { ...room, items: newItems };
            }
            return room;
        }));
    };
    
    // Remove unassigned item
    const removeUnassignedItem = (itemId: string) => {
        setUnassignedItems(prev => {
            const existingItem = prev.find(item => item.itemId === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prev.map(item => 
                    item.itemId === itemId 
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            } else {
                return prev.filter(item => item.itemId !== itemId);
            }
        });
    };

    // Add custom item
    const addCustomItem = (name: string, length: string, width: string, height: string) => {
        if (!name || !length || !width || !height) {
            toast.error('Please fill in all fields');
            return;
        }

        const volume = (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 1000000; // Convert cm³ to m³

        const newItem: FurnitureItem = {
            id: `custom_${Date.now()}`,
            name: name,
            volume: volume,
            category: 'Custom',
            icon: '📦'
        };

        setCustomItems(prev => [...prev, newItem]);
        toast.success(`${name} added successfully!`);
    };

    // Clear all
    const clearAll = () => {
        // Clear items from all rooms but keep the room structure
        setRooms(prev => prev.map(room => ({
            ...room,
            items: {}
        })));
        setCustomItems([]);
        setUnassignedItems([]);
        closeRoomSelectionModal();
    };

    const handleSaveComplete = (success: boolean, message: string) => {
        if (success) {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    // Get calculation results for saving
    const getCalculationResults = () => {
        const furnitureVolume = calculateTotalVolume();
        const boxData = calculateBoxVolume();
        const totalVolume = furnitureVolume + boxData.estimatedVolumeM3;
        const recommendedTruck = getRecommendedTruck();
        const CURRENT_BOX_VOLUME = selectedBoxSize.volume;
        
        return {
            totalVolume: totalVolume,
            furnitureVolume: furnitureVolume,
            boxVolume: boxData.estimatedVolumeM3,
            totalBoxes: boxData.totalBoxes,
            regularBoxes: boxData.regularBoxCount,
            fragileBoxes: boxData.totalFragileBoxCount,
            boxWarning: boxData.warning,
            recommendedTruck: {
                name: recommendedTruck.name,
                volume: recommendedTruck.volume,
                price: recommendedTruck.price,
                description: recommendedTruck.description
            },
            roomBreakdown: rooms.map(room => {
                const roomBoxSize = room.selectedBoxSize || boxSizes[0];
                const roomRegularBoxCount = room.autoRegularBoxCount || 0;
                const roomFragileBoxCount = room.autoFragileBoxCount || 0;
                const roomTotalBoxCount = roomRegularBoxCount + roomFragileBoxCount;
                const roomBoxVolume = roomTotalBoxCount * roomBoxSize.volume;
                const roomFurnitureVolume = Object.entries(room.items).reduce((total, [itemId, quantity]) => {
                    const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                    return total + (item ? item.volume * quantity : 0);
                }, 0);
                
                return {
                    name: room.name,
                    boxCount: roomTotalBoxCount,
                    regularBoxCount: roomRegularBoxCount,
                    fragileBoxCount: roomFragileBoxCount,
                    boxVolume: roomBoxVolume,
                    boxSize: {
                        name: roomBoxSize.name,
                        volume: roomBoxSize.volume,
                        description: roomBoxSize.description
                    },
                    items: Object.entries(room.items).map(([itemId, quantity]) => {
                        const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                        return item ? {
                            name: item.name,
                            quantity: quantity,
                            volume: item.volume * quantity,
                            category: item.category
                        } : null;
                    }).filter(Boolean),
                    furnitureVolume: roomFurnitureVolume,
                    totalVolume: roomFurnitureVolume + roomBoxVolume
                };
            })
        };
    };

    // Get form data for saving
    const getFormData = () => {
        return {
            rooms: rooms,
            customItems: customItems
        };
    };

    const categories = ['All', ...Array.from(new Set(furnitureDatabase.map(item => item.category))), 'Custom'];
    const filteredItems = selectedCategory === 'All' 
        ? [...furnitureDatabase, ...customItems]
        : [...furnitureDatabase, ...customItems].filter(item => item.category === selectedCategory);

    return (
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {/* Saved Results Sidebar */}
                <div className="xl:col-span-1">
                    <SavedResultsSidebar toolType="volume" initialSavedResults={initialSavedResults} />
                </div>
                
                {/* Main Calculator */}
                <div className="xl:col-span-3">
                    <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-200 overflow-hidden font-sans">
                        {/* Header */}
                        <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700">Volume Calculator</h3>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {calculateTotalVolume() > 0 && (
                            <SaveResultsButton
                                toolType="volume"
                                results={getCalculationResults()}
                                formData={getFormData()}
                                onSaveComplete={handleSaveComplete}
                                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                            />
                        )}
                        <button
                            onClick={clearAll}
                            className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <VolumeSummaryCards 
                totalVolume={calculateTotalVolumeWithBoxes()} 
                furnitureVolume={calculateTotalVolume()}
                boxVolume={calculateBoxVolume().estimatedVolumeM3}
                totalBoxes={calculateBoxVolume().totalBoxes}
                regularBoxes={calculateBoxVolume().regularBoxCount}
                fragileBoxes={calculateBoxVolume().totalFragileBoxCount}
                autoFragileBoxes={calculateBoxVolume().autoFragileBoxCount}
                recommendedTruck={getRecommendedTruck()}
                boxWarning={calculateBoxVolume().warning}
            />

            {/* Room-by-Room Survey Interface */}
            <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 border-t border-gray-200">
                {/* Room Navigation Tabs */}
                <RoomNavigationTabs 
                    rooms={rooms}
                    currentRoomIndex={currentRoomIndex}
                    furnitureDatabase={furnitureDatabase}
                    customItems={customItems}
                    onRoomSelect={goToRoom}
                />
                
                {/* Current Room Survey */}
                {rooms[currentRoomIndex] && (
                    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                            <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                                {rooms[currentRoomIndex].name}
                            </h4>
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                                {/* Room Box Size Selector */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                                    <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                        📦 Box Size:
                                    </label>
                                    <select 
                                        value={rooms[currentRoomIndex].selectedBoxSize?.name || boxSizes[0].name}
                                        onChange={(e) => {
                                            const selected = boxSizes.find(box => box.name === e.target.value);
                                            if (selected) updateRoomBoxSize(rooms[currentRoomIndex].id, selected);
                                        }}
                                        className="px-2 py-1 text-xs text-gray-900 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                    >
                                        {boxSizes.map(box => (
                                            <option key={box.name} value={box.name} className="text-gray-900">
                                                {box.name} ({box.volume}m³)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                    Room {currentRoomIndex + 1} of {rooms.length}
                                </div>
                            </div>
                        </div>

                        {/* Box Calculation Info */}
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-center">
                                <h5 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">
                                    📦 Box Calculation for {rooms[currentRoomIndex].name}
                                </h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-blue-100 p-2 rounded">
                                        <div className="font-medium text-blue-900">Regular Boxes</div>
                                        <div className="text-lg font-bold text-blue-700">{rooms[currentRoomIndex].autoRegularBoxCount || 0}</div>
                                        <div className="text-xs text-blue-600">Auto-calculated for small items</div>
                                    </div>
                                    <div className="bg-orange-100 p-2 rounded">
                                        <div className="font-medium text-orange-900">Fragile Boxes</div>
                                        <div className="text-lg font-bold text-orange-700">{rooms[currentRoomIndex].autoFragileBoxCount || 0}</div>
                                        <div className="text-xs text-orange-600">Auto-calculated for fragile items</div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 italic">
                                    💡 Boxes are automatically calculated using {rooms[currentRoomIndex].selectedBoxSize?.name || 'Medium'} boxes ({rooms[currentRoomIndex].selectedBoxSize?.volume || boxSizes[0].volume}m³) for this room.
                                </p>
                            </div>
                        </div>
                        
                        {/* Preset Items for Current Room */}
                        <PresetItemsList 
                            items={getPresetItemsForRoom(rooms[currentRoomIndex].name)}
                            getItemQuantity={getItemQuantity}
                            onIncrement={incrementItem}
                            onDecrement={decrementItem}
                        />
                        
                        {/* Dropdown for All Items */}
                        <ItemDropdown 
                            items={getAllItemsSorted()}
                            onItemSelect={incrementItem}
                        />
                        
                        {/* Items Added to Current Room */}
                        <RoomItemsList 
                            items={rooms[currentRoomIndex].items}
                            furnitureDatabase={furnitureDatabase}
                            customItems={customItems}
                        />
                        
                        {/* Navigation Buttons */}
                        <RoomNavigationButtons 
                            currentRoomIndex={currentRoomIndex}
                            totalRooms={rooms.length}
                            onPrevious={goToPreviousRoom}
                            onNext={goToNextRoom}
                        />
                    </div>
                )}
            </div>

            {/* Custom Item Form */}
            <CustomItemForm onAddItem={addCustomItem} />

            {/* Unassigned Items */}
            {calculateTotalVolume() > 0 && (
                <UnassignedItemsList 
                    unassignedItems={unassignedItems}
                    furnitureDatabase={furnitureDatabase}
                    customItems={customItems}
                    onRemoveItem={removeUnassignedItem}
                />
            )}

            {/* Room Selection Modal */}
            <RoomSelectionModal 
                isOpen={roomSelectionModal.isOpen}
                selectedItem={roomSelectionModal.selectedItem}
                rooms={rooms}
                onClose={closeRoomSelectionModal}
                onAddToRoom={addItemToRoom}
                onAddUnassigned={addItemUnassigned}
            />

            {/* Truck Recommendations */}
            <TruckRecommendations 
                truckSizes={truckSizes}
                totalVolume={calculateTotalVolumeWithBoxes()}
            />
                    </div>
                </div>
            </div>
        </div>
    );
}
