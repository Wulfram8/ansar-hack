import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

Highcharts.setOptions({
  lang: {
    loading: "Загрузка...",
    months: [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
    ],
    shortMonths: [
      "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
      "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
    ],
    weekdays: [
      "Воскресенье", "Понедельник", "Вторник", "Среда",
      "Четверг", "Пятница", "Суббота",
    ],
    noData: "Нет данных для отображения",
  },
  credits: { enabled: false },
});

interface ChartProps {
  title: string;
  options: Highcharts.Options;
}

export function Chart({ title, options }: ChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </CardContent>
    </Card>
  );
}
