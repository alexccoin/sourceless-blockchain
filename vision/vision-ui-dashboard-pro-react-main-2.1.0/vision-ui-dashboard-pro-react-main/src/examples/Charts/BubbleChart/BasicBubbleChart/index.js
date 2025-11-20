import Chart from 'react-apexcharts';

const BubbleChart = (props) => {
  const { chartData, chartOptions } = props;

  return (
    // @ts-ignore
    <Chart
      options={chartOptions}
      type="bubble"
      width="100%"
      height="100%"
      series={chartData}
    />
  );
};

export default BubbleChart;
