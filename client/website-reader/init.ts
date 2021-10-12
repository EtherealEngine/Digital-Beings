import { createWebsiteReader } from "./website-reader";

//npm run read_book --url https://booksvooks.com/scrolablehtml/pale-blue-dot-a-vision-of-the-human-future-in-space-pdf.html?page=1 --pages 210 --fileName test
const params = process.argv.slice(2);
createWebsiteReader(params[0], parseInt(params[1]), params[2]);