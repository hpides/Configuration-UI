export interface TestConfig {
    repeat: number;
    scaleFactor: number;
    activeInstancesPerSecond: number;
    maximumConcurrentRequests: number;
    stories: Story[]; 
}

export interface Story {
    name: string;
    scalePercentage: number;
}