import Chart from 'react-apexcharts';

const BasicLineChart = (props) => {
  const { chartData, chartOptions } = props;

  return (
    // @ts-ignore
    <Chart
      options={chartOptions}
      type="area"
      width="100%"
      height="100%"
      series={chartData}
    />
  );
};

export default BasicLineChart;
