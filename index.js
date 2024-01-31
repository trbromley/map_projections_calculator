addEventListener("DOMContentLoaded", (event) => {
    const hovers = document.querySelectorAll('[data-bs-toggle="hovers"]');
    [...hovers].map(hover => new bootstrap.Tooltip(hover))

    // Get math fields
    pX = document.querySelector("#projection_x")
    pY = document.querySelector("#projection_y")

    pX.menuItems = []
    pY.menuItems = []

    // Create engine
    eng = new ComputeEngine.ComputeEngine()
    
    // Create SVG
    width = 800
    height = 480
    svg = d3.select("#projection")
            .append("svg")
            .attr("width", width)
            .attr("height", height)

    // Get button
    update = document.querySelector("#update")

    // Licence for data file to be downloaded:
    // Copyright 2013-2019 Michael Bostock
    //
    // Permission to use, copy, modify, and/or distribute this software for any purpose
    // with or without fee is hereby granted, provided that the above copyright notice
    // and this permission notice appear in all copies.
    //
    // THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    // REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
    // FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    // INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
    // OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
    // TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
    // THIS SOFTWARE.
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json").then(
        function(data) {
            [xFunc, yFunc] = get_projection(pX.value, pY.value)
            draw_projection(data, xFunc, yFunc, svg)

            update.addEventListener("click", function() {
                error_output({message: ""})
                try {
                    [xFunc, yFunc] = get_projection(pX.value, pY.value)
                    draw_projection(data, xFunc, yFunc, svg)
                }
                catch(err) {
                    error_output(err)
                }
            })
        }
    )
}
);

function get_projection(exprX, exprY) {
    try {
        x = eng.parse(exprX).compile()
    }
    catch(err) {
        throw new Error("Error in x")
    }
    try {
        y = eng.parse(exprY).compile()
    }
    catch(err) {
        throw new Error("Error in y")
    }
    return [x, y]
}

function draw_projection(data, xFunc, yFunc, svg) {
    geoJSON = topojson.feature(data, data.objects.countries)

    try {
        projection = d3.geoProjection(function(lambda, phi) {

            try {
                x = xFunc({lambda: lambda, phi: phi})
            }
            catch(err) {
                throw new Error("Error in x")
            }
            try {
                y = yFunc({lambda: lambda, phi: phi})
            }
            catch(err) {
                throw new Error("Error in y")
            }

            if (isNaN(x)) {
                throw new Error("Error in x")
            }
            if (isNaN(y)) {
                throw new Error("Error in y")
            }
            return [x, y];
        });
    }
    catch(err) {
        error_output(err)
        return
    }

    projection.fitSize([svg.attr("width"), svg.attr("height")], geoJSON)

    svg.selectAll("g").remove()

    try {
        svg.append("g")
            .selectAll("path")
            .data(geoJSON.features)
            .join("path")
                .attr("fill", "#198754")
                .style("stroke", "#fff")
                .attr("d", d3.geoPath().projection(projection))
    }
    catch(err) {
        error_output(err)
        return
    }
}

function error_output(err) {
    errorBox = document.querySelector("#error")
    errorBox.innerHTML = err.message
}
