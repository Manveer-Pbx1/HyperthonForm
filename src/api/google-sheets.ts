const saveData = async (data: any) => {
  // Replace this with google sheets one
  const response = await fetch("kuch bhi url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response;
};

export default saveData;
