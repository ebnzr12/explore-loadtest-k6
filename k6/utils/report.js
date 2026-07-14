import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export function generateReport(data, endpoint, reportName){
    return {
        [`Report_Performance/${endpoint}/${reportName}.html`]: htmlReport(data)
    };
}