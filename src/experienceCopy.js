const legacy = {
  "forestry-2026": "Sole developer of a Wildlife Management mobile app and admin panel using Flutter, PHP, and MySQL. Gathered field officers’ feedback and improved tracking and reporting workflows. Wrote maintainable code and tested system updates before deployment. Coordinated meetings between external agencies and internal management, recorded minutes, and followed up on tasks. Participated in crocodile monitoring, humane trap setup, and wildlife call responses across Brunei under government guidelines. Delivered school safety briefings and designed digital educational materials for Ministry programs.",
  "bandaran-2018": "Configured computers, monitors, and staff equipment; installed software updates, drivers, and system patches. Helped troubleshoot internet and Wi-Fi connections, repair damaged cabling, and support network checks and cable management. Built an Excel inventory using VLOOKUP and Pivot Tables to track hardware and software assets. Maintained office printers and set up meeting-room audio/visual equipment."
};
const revised = {
  "forestry-2026": "I built a Wildlife Management app and its admin panel using Flutter, PHP, and MySQL. I worked with field officers to understand their reporting needs, updated the workflows from their feedback, and tested changes before deployment.\n\nI also organised meetings, wrote minutes, and followed up on agreed tasks. Outside the development work, I joined crocodile monitoring and wildlife call responses, helped with humane trap setup, and delivered school safety briefings and digital learning materials.",
  "bandaran-2018": "I helped staff set up computers and office equipment, installed updates and drivers, and troubleshot internet and Wi-Fi problems. I also assisted with cabling, printer maintenance, and meeting-room audio and video equipment.\n\nI built an Excel inventory using VLOOKUP and Pivot Tables to keep track of the department's hardware and software."
};
// Refresh the original bundled wording while preserving later owner edits.
export function experienceParagraphs(item) {
  const description = item.description === legacy[item.id] ? revised[item.id] : item.description;
  return (description || '').split(/\n\s*\n/).filter(Boolean);
}
