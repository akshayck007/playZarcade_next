async function main() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/seed');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error calling seed API:", error);
  }
}

main();
