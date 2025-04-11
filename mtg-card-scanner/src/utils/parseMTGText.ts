export const parseMTGText = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
    const collectorNumber = lines.find(line =>
      /\d{1,3}\/\d{1,3}/.test(line)
    );
  
    const cardTitle = lines.find(line =>
      /^[A-Z][a-zA-Z\s\-']{2,30}$/.test(line) && !line.match(/\d/)
    );
  
    return { cardTitle, collectorNumber };
  };