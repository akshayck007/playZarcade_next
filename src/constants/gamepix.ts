export const GAMEPIX_SID = "ZA727";
export const GAMEPIX_BASE_FEED_URL = "https://feeds.gamepix.com/v2/json";

export const GAMEPIX_CATEGORIES = [
  "All", "2048", "Action", "Addictive", "Adventure", "Airplane", "Animal", "Anime", "Arcade", "Archery",
  "Baby", "Ball", "Barbie", "Baseball", "Basketball", "Battle", "Battle Royale", "Bejeweled", "Bike", "Block",
  "Board", "Bowling", "Boxing", "Brain", "Bubble Shooter", "Building", "Car", "Card", "Casual", "Cats",
  "Checkers", "Chess", "Christmas", "City Building", "Classics", "Clicker", "Coding", "Coloring", "Cooking", "Cool",
  "Crazy", "Cricket", "Dinosaur", "Dirt Bike", "Dragons", "Drawing", "Dress Up", "Drifting", "Driving", "Educational",
  "Escape", "Family", "Farming", "Fashion", "Fighting", "Fire And Water", "First Person Shooter", "Fishing", "Flash", "Flight",
  "Fun", "Games For Girls", "Gangster", "Gdevelop", "Golf", "Granny", "Gun", "Hair Salon", "Halloween", "Helicopter",
  "Hidden Object", "Hockey", "Horror", "Horse", "Hunting", "Hyper Casual", "Idle", "Io", "Jewel", "Jigsaw Puzzles",
  "Jumping", "Junior", "Kids", "Knight", "Mahjong", "Makeup", "Management", "Mario", "Match 3", "Math",
  "Memory", "Mermaid", "Minecraft", "Mining", "Mmorpg", "Mobile", "Money", "Monster", "Multiplayer", "Music",
  "Naval", "Ninja", "Ninja Turtle", "Offroad", "Open World", "Parking", "Parkour", "Piano", "Pirates", "Pixel",
  "Platformer", "Police", "Pool", "Princess", "Puzzle", "Racing", "Restaurant", "Retro", "Robots", "Rpg",
  "Runner", "Scary", "Scrabble", "Sharks", "Shooter", "Simulation", "Skateboard", "Skibidi Toilet", "Skill", "Snake",
  "Sniper", "Soccer", "Solitaire", "Spinner", "Sports", "Stickman", "Strategy", "Surgery", "Survival", "Sword",
  "Tanks", "Tap", "Tetris", "Trivia", "Truck", "Two Player", "Tycoon", "War", "Word", "World Cup",
  "Worm", "Wrestling", "Zombie"
];

export interface GamePixItem {
  id: string;
  title: string;
  namespace: string;
  description: string;
  category: string;
  orientation: string;
  quality_score: number;
  width: number;
  height: number;
  date_modified: string;
  date_published: string;
  banner_image: string;
  image: string;
  url: string;
}

export interface GamePixResponse {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  next_url: string;
  previous_url?: string;
  first_page_url: string;
  last_page_url: string;
  modified: string;
  items: GamePixItem[];
}
