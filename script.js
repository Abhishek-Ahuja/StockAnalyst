let stocksData;
let stocksStatsData;
let stocksProfileData;
let myLineChart;


function createCanvas(key , duration) {
    console.log(duration) ; 
    console.log(stocksData[0][key]["1mo"])
  const { timeStamp, value } = stocksData[0][key][duration];
  if (myLineChart) {
    myLineChart.destroy();
  }
  const ctx = document.getElementById("myChart");
  const labels = timeStamp;
  const data = {
    labels: labels,
    datasets: [{ data: value }]
  };
  const footer = (tooltipItems) => {
    let sum = 0;
    tooltipItems.forEach(function(tooltipItem) {
      sum += tooltipItem.parsed.y;
    });
    return `${key}` + sum;
  };
  const config = {
    type: "line",
    data: data,
    options: {
      borderColor: "#35EC18",
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        title: { display: false },
        tooltip: {
          callbacks: { footer: footer }
        },
        legend: { display: false },
        annotation: {
            annotations: {
              peak: {
                type: 'line',
                borderColor: 'red',
                borderWidth: 2,
                label: {
                  content: () => `Peak: ${Math.max(...value)}`,
                  enabled: true,
                  position: 'top'
                },
                scaleID: 'y',
                value: Math.max(...value),
              },
              low: {
                type: 'line',
                borderColor: 'blue',
                borderWidth: 2,
                label: {
                  content: () => `Low: ${Math.min(...value)}`,
                  enabled: true,
                  position: 'bottom'
                },
                scaleID: 'y',
                value: Math.min(...value),
              }
            }
          }
    },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      interaction: {
        mode: "nearest",
        intersect: false
      },
      onHover: function(event, chartElement) {
        const tooltip = document.getElementById("tooltip");
        if (chartElement.length) {
          const index = chartElement[0].index;
          const xValue = config.data.labels[index];
          const date = new Date(xValue * 1000);
          const formattedDate = date.toLocaleDateString();
          tooltip.innerText = `Date: ${formattedDate}`;
          tooltip.style.display = "block";
          tooltip.style.left = `${event.native.offsetX + 10}px`;
          tooltip.style.top = `${event.native.offsetY - 20}px`;
        } else {
          tooltip.style.display = "none";
        }
      }
    }
  };
  myLineChart = new Chart(ctx, config);
}

function createDetails(key , duration) {
  const detailsEl = document.getElementById("details");
  const { summary } = stocksProfileData[0][key];
  const { bookValue, profit } = stocksStatsData[0][key];
 detailsEl.innerHTML = `
    <div class="summary-header">
    <h1>${key}</h1>
    <span>$${bookValue}</span>
    <span>${profit}%</span>
    </div>
    <p >${summary}</p>
 `
 
}

async function render() {
  let response = await fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstockstatsdata");
  let data = await response.json();
  stocksStatsData = data.stocksStatsData;
  
  response = await fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata");
  data = await response.json();
  stocksData = data.stocksData;
  console.log(stocksData) ; 
  response = await fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstocksprofiledata");
  data = await response.json();
  stocksProfileData = data.stocksProfileData;
  
  let stockListEl = document.getElementById("stock-list");
  stockListEl.textContent = "";
  for (let key in stocksStatsData[0]) {
    if (key !== "_id") {
      const listElement = document.createElement("li");
      const { bookValue, profit } = stocksStatsData[0][key];
      const buttonEl = document.createElement("button");
      buttonEl.className = "stock-btn";
      buttonEl.textContent = key;
      const bookValueEl = document.createElement("span");
      bookValueEl.textContent = bookValue;
      const profitEl = document.createElement("span");
      if (profit.toFixed(2) > 0) {
        profitEl.textContent = `${profit.toFixed(2)}%`;
        profitEl.className = "profit";
      } else {
        profitEl.textContent = `0.00%`;
        profitEl.className = "loss";
      }
   
      listElement.appendChild(buttonEl);
      listElement.appendChild(bookValueEl);
      listElement.appendChild(profitEl);
      buttonEl.addEventListener("click", () => {
        const month1 = document.getElementById("1mo");
        const month3 = document.getElementById("3mo");
        const year1 = document.getElementById("1y");
        const year5 = document.getElementById("5y")

        month1.addEventListener("click" , ()=>{
            createCanvas(key , "1mo");
      
        })
        month3.addEventListener("click" , ()=>{
            createCanvas(key , "3mo");
      
        })
        year1.addEventListener("click" , ()=>{
            createCanvas(key , "1y");
      
        })
        year5.addEventListener("click" , ()=>{
            createCanvas(key , "5y");
      
        })


        createCanvas(key , "1mo");
        createDetails(key , "1mo");
      });
      stockListEl.appendChild(listElement);
    }
  }
  createCanvas("AAPL" , "1mo");
  createDetails("AAPL" , "1mo");
}

render();
